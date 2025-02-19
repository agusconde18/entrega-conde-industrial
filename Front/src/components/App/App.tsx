import React from 'react';
import styles from './styles.module.scss';
import Chart from "../Chart";
import NumberPickerLocal from "../NumberPicker";
import ActualTemp from "../ActualTemp";

function App() {
    const onChangeValue = (value: number) => {
        console.log(value);
    }
    return (
        <div className={styles.app}>
            {/* Header */}
            <header className="App-header">
                <h1>Controlador digital</h1>
            </header>
            {/* Selector  */}
            <NumberPickerLocal step={1} minimumValue={1} maximumValue={400} onChangeValue={() => onChangeValue}/>
            <hr className={styles.hrDividers}/>
            <ActualTemp/>
            <hr className={styles.hrDividers}/>
            <Chart/>
        </div>
    );
}

export default App;
