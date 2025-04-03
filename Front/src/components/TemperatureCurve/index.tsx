import React, { useState } from 'react';
import { LineChart } from '@mui/x-charts';
import { Button, TextField } from '@mui/material';
import styles from './styles.module.scss';

const predefinedCurves: { [key: string]: { [key: string]: { time: number, temperature: number, mandatory?: boolean }[] } } = {
    low: {
        con: [{ time: 0, temperature: 40 }, { time: 60, temperature: 100 }, { time: 120, temperature: 130 }, { time: 150, temperature: 200, mandatory: true }, { time: 210, temperature: 170 }, { time: 700, temperature: 0 }],
        sin: [{ time: 0, temperature: 40 }, { time: 60, temperature: 100 }, { time: 120, temperature: 120 }, { time: 150, temperature: 180, mandatory: true }, { time: 210, temperature: 150 }, { time: 700, temperature: 0 }]
    },
    medium: {
        con: [{ time: 0, temperature: 40 }, { time: 60, temperature: 130 }, { time: 120, temperature: 170 }, { time: 150, temperature: 230, mandatory: true }, { time: 210, temperature: 180 }, { time: 700, temperature: 0 }],
        sin: [{ time: 0, temperature: 40 }, { time: 60, temperature: 130 }, { time: 120, temperature: 180 }, { time: 150, temperature: 240, mandatory: true }, { time: 210, temperature: 240 }, { time: 700, temperature: 0 }]
    },
    high: {
        con: [{ time: 0, temperature: 40 }, { time: 60, temperature: 130 }, { time: 120, temperature: 190 }, { time: 150, temperature: 270, mandatory: true }, { time: 210, temperature: 250 }, { time: 700, temperature: 0 }],
        sin: [{ time: 0, temperature: 40 }, { time: 60, temperature: 130 }, { time: 120, temperature: 190 }, { time: 150, temperature: 270, mandatory: true }, { time: 210, temperature: 250 }, { time: 700, temperature: 0 }]
    }
};

interface TemperatureCurveProps {
    onStart: (curve: { time: number, temperature: number }[]) => void;
}

export default function TemperatureCurve({ onStart }: TemperatureCurveProps) {
    const [data, setData] = useState<{ time: number, temperature: number }[]>([{ time: 0, temperature: 40 }]);
    const [selectedCurve, setSelectedCurve] = useState<string | null>(null);
    const [leadOption, setLeadOption] = useState<string | null>(null);
    const [newTime, setNewTime] = useState<number>(0);
    const [newTemperature, setNewTemperature] = useState<number>(0);

    const handleAddPoint = () => {
        if (newTime <= 0 || data.some(point => Math.abs(point.time - newTime) < 2)) {
            alert('No se pueden agregar puntos en tiempos negativos o demasiado cercanos.');
            return;
        }
        const newPoint = { time: newTime, temperature: newTemperature };
        const newData = [...data, newPoint].sort((a, b) => a.time - b.time);
        setData(newData);
    };

    const handleRemovePoint = () => {
        if (data.length > 1) {
            setData(data.slice(0, -1));
        }
    };

    const handleSelectCurve = (curve: string) => {
        setSelectedCurve(curve);
        setLeadOption(null);
    };

    const handleSelectLeadOption = (option: string) => {
        setLeadOption(option);
        if (selectedCurve) {
            setData(predefinedCurves[selectedCurve][option]);
        }
    };

    const handleStart = () => {
        onStart(data);
    };

    return (
        <div className={styles.temperatureCurve}>
            <h2>Definir Curva de Temperatura</h2>
            <div className={styles.contaierSideBySide}>
                <div className={styles.leftPanel}>
                    <h3>Seleccionar tipo de curva</h3>
                    <div>
                        <Button variant="contained" color={selectedCurve === 'low' ? 'secondary' : 'primary'} onClick={() => handleSelectCurve('low')}>Baja</Button>
                        <Button variant="contained" color={selectedCurve === 'medium' ? 'secondary' : 'primary'} onClick={() => handleSelectCurve('medium')}>Media</Button>
                        <Button variant="contained" color={selectedCurve === 'high' ? 'secondary' : 'primary'} onClick={() => handleSelectCurve('high')}>Alta</Button>
                    </div>
                    {selectedCurve && (
                        <div>
                            <Button variant="contained" color={leadOption === 'con' ? 'secondary' : 'primary'} onClick={() => handleSelectLeadOption('con')}>Con Plomo</Button>
                            <Button variant="contained" color={leadOption === 'sin' ? 'secondary' : 'primary'} onClick={() => handleSelectLeadOption('sin')}>Sin Plomo</Button>
                        </div>
                    )}
                </div>
                <hr />
                <div className={styles.rightPanel}>
                    <div>
                        <div className={styles.containerInputs}>
                            <TextField
                                label="Tiempo (segundos)"
                                type="number"
                                value={newTime}
                                onChange={(e) => setNewTime(Number(e.target.value))}
                                className={styles.timeInput}
                            />
                            <TextField
                                label="Temperatura (°C)"
                                type="number"
                                value={newTemperature}
                                onChange={(e) => setNewTemperature(Number(e.target.value))}
                                className={styles.temperatureInput}
                            />
                        </div>
                        <Button variant="contained" color="secondary" onClick={handleAddPoint}>Agregar Punto</Button>
                        <br />
                        <Button variant="contained" color="secondary" onClick={handleRemovePoint} className={styles.removePoint}>Remover Último Punto</Button>
                    </div>
                </div>
            </div>
            {leadOption && (
                <LineChart
                    xAxis={[{ data: data.map(point => point.time) }]}
                    series={[{ data: data.map(point => point.temperature) }]}
                    height={300}
                    width={600}
                />
            )}
            <Button variant="contained" color="success" onClick={handleStart} disabled={data.length < 2}>Iniciar</Button>
        </div>
    );
}
