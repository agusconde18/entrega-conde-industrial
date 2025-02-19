import React, {useEffect, useRef} from "react";
import styles from "./styles.module.scss";
import useChangeTemp from "../utils/querys/useChangeTemp";

export default function CustomHorizontalSlider(props: {
    minimumValue: number,
    maximumValue: number,
    step: number,
    onChangeValue: (value: number) => void
}) {
    const ref = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = React.useState(props.minimumValue);
    const [temp, setTemp] = React.useState(0);
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value);
        setValue(newValue);
        props.onChangeValue(newValue);
    }
    useChangeTemp({temp});

    useEffect(() => {
        if(ref.current) {
            // Listen onMouseUp event
            ref.current.addEventListener('mouseup', (e) => {
                setTemp(parseInt(ref.current?.value ?? '0'));
            });

            // listen for mobile touchend event
            ref.current.addEventListener('touchend', (e) => {
                setTemp(parseInt(ref.current?.value ?? '0'));
            });
        }
    }, []);

    return (
        <div className={styles.containerPicker}>
            <h2>Temperatura seteada: </h2>
            <p>{value}°C</p>
            <input ref={ref} className={styles.horizontalSelct} type="range" min={props.minimumValue} max={props.maximumValue}
                   step={props.step} value={value} onChange={onChange} />
        </div>
    );
};
