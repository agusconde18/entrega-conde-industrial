import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.scss';
import Chart from '../Chart';
import NumberPickerLocal from '../NumberPicker';
import ActualTemp from '../ActualTemp';
import TemperatureCurve from '../TemperatureCurve';
import { Button, Tabs, Tab } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import useLiveTemp from '../utils/querys/useLiveTemp';
import useChangeTemp from '../utils/querys/useChangeTemp';

function App() {
    const [mode, setMode] = useState<'manual' | 'curve'>('manual');
    const [curveData, setCurveData] = useState<{ time: number, temperature: number, mandatory?: boolean }[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [targetTemp, setTargetTemp] = useState(40);
    const [currentTempData, setCurrentTempData] = useState<{ time: number, temperature: number }[]>([]);
    const { data: currentTemp, refetch: refetchTemp } = useLiveTemp();
    const { refetch: changeTemp } = useChangeTemp({ temp: targetTemp });
    const [startTime, setStartTime] = useState<number | null>(null);
    const [runningCurve, setRunningCurve] = useState<boolean>(false);
    const [errorRunning, setErrorRunning] = useState<boolean>(false);

    const isMandatorioDone = useRef(false);
    const isRunningRef = useRef(isRunning);
    const offsetRun = useRef(0);
    const startTimeRef = useRef(startTime);
    const curveDataRef = useRef(curveData);
    const currentTempRef = useRef(currentTemp);

    useEffect(() => {
        isRunningRef.current = isRunning;
        startTimeRef.current = startTime;
        curveDataRef.current = curveData;
        currentTempRef.current = currentTemp;
    }, [isRunning, startTime, curveData, currentTemp]);

    useEffect(() => {
        if (isRunning) {
            setErrorRunning(false);
            refetchTemp().then(() => refetchTemp());
            setTargetTemp(40);
            changeTemp();
        }

    }, [isRunning, refetchTemp]);

    useEffect(() => {
        if (isRunning && !runningCurve && currentTemp !== undefined && currentTemp >= 38 && currentTemp <= 55) {
            isMandatorioDone.current = false;
            setRunningCurve(true);
            setStartTime(Date.now());
            startCurveProcess();
        }
    }, [currentTemp, isRunning]);

    const runningCurveFn = useCallback((interval: any) => {
        if (!isRunningRef.current) {
            setTargetTemp(2);
            setTargetTemp(1);
            clearInterval(interval);
        }

        const elapsedTime = ((Date.now() - (startTimeRef.current ?? Date.now())) / 1000) - offsetRun.current  ; // tiempo transcurrido en segundos
        const maxTime = curveDataRef.current[curveDataRef.current.length - 1].time;
        // se suma 6 ya que 6 segundos es el estimado que teemos que tarda en reaccionar la celda
        const currentPoint = curveDataRef.current.reverse().find(point => point.time <= elapsedTime + 6);
        const mandatorio = currentPoint?.mandatory;
        const nextPoint = curveDataRef.current.reverse().find(point => point.time > (currentPoint?.time ?? Number.MAX_VALUE)) ?? { temperature: 0, time: Number.MAX_VALUE };
        if(offsetRun.current > 120) {
            setErrorRunning(true);
            clearInterval(interval);
            stopAllWithoutClose();
        }

        if (currentPoint && nextPoint && maxTime > elapsedTime) {
            if(mandatorio && !isMandatorioDone.current && currentPoint.temperature > (currentTempRef.current ?? 0)) {
                offsetRun.current++;
            } else if (mandatorio) {
                isMandatorioDone.current = true;
            }
            const timeDiff = nextPoint.time - currentPoint.time;
            const tempDiff = nextPoint.temperature - currentPoint.temperature;
            let newTemp = currentPoint.temperature + (tempDiff / timeDiff) * ((elapsedTime) - currentPoint.time) - (mandatorio ? 0 : 5);
            //newTemp = nextPoint.temperature;
            setTargetTemp(newTemp);
            setCurrentTempData(prevData => [...prevData, { time: elapsedTime + offsetRun.current, temperature: Number(currentTempRef.current) }]);
        } else {
            setRunningCurve(false);
            //clearInterval(interval);
            sendFinalTemperatures();
        }
    }, []);

    const startCurveProcess = () => {
        const interval = setInterval(() => runningCurveFn(interval), 1000);
    };

    const sendFinalTemperatures = () => {
        let count = 0;
        const interval = setInterval(() => {
            if (count < 15) {
                setTargetTemp(0);
                setCurrentTempData(prevData => [...prevData, { time: prevData.length, temperature: 0 }]);
                count++;
            } else {
                clearInterval(interval);
                //setIsRunning(false);
            }
        }, 1000);
    };

    const handleStartCurve = (curve: { time: number, temperature: number }[]) => {
        setCurveData(curve);
        setIsRunning(true);
    };

    const handleStop = () => {
        stopAllWithoutClose();
        setIsRunning(false);
    };

    const stopAllWithoutClose = () => {
        offsetRun.current = 0;
        setTargetTemp(2);
        setTargetTemp(1);
        changeTemp();
        setRunningCurve(false);
        setCurrentTempData([]);
    }

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: 'manual' | 'curve') => {
        setMode(newValue);
    };

    const xAxis = [{ data: [...currentTempData.map(point => point.time), ...curveData.map(point => point.time)] }];
    let xAxisUnique = xAxis.map(({ data }) => ({ data: data.filter((value, index, self) => self.indexOf(value) === index) }));
    xAxisUnique = xAxisUnique.map(({ data }) => ({ data: data.sort((a, b) => a - b) }));

    const series = [
        { connectNulls: true, showMark: false, data: xAxisUnique[0].data.map(time => currentTempData.find(point => point.time === time)?.temperature ?? null), label: 'Temperatura Actual' },
        { connectNulls: true, showMark: true, data: xAxisUnique[0].data.map(time => curveData.find(point => point.time === time)?.temperature ?? null), label: 'Curva Definida' }
    ];

    return (
        <div className={styles.app}>
            <header className="App-header">
                <h1>Controlador digital</h1>
            </header>
            <Tabs value={mode} onChange={handleTabChange}>
                <Tab label="Manual" value="manual" />
                <Tab label="Manual" value="manual" />
                <Tab label="Operación por curva" value="curve" />
            </Tabs>
            {mode === 'manual' ? (
                <>
                    <NumberPickerLocal step={1} minimumValue={1} maximumValue={400} onChangeValue={(value) => console.log(value)} />
                    <hr className={styles.hrDividers} />
                    <ActualTemp />
                    <hr className={styles.hrDividers} />
                    <Chart />
                </>
            ) : (
                !isRunning && <TemperatureCurve onStart={handleStartCurve} />
            )}
            {isRunning && (
                <div>
                    <h2>Curva Definida</h2>
                    <LineChart
                        xAxis={xAxisUnique}
                        series={series}
                        height={300}
                        width={600}
                    />
                    <h2>Temperatura Actual: {currentTemp}°C</h2>
                    {offsetRun.current > 0 && (<p>Se extenderá la curva {offsetRun.current} segundos, porque a la celda le cuesta llegar a la temperatura maxima (en sus limites maximos).</p>)}
                    {errorRunning && (<p>Error al levantar maxima curva debido a que la celda fue incapaz de llegar a la temperatura maxima.</p>)}
                    <Button variant="contained" color="error" onClick={handleStop}>Stop</Button>
                </div>
            )}
        </div>
    );
}

export default App;
