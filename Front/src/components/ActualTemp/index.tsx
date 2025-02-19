import React from "react";
import styles from "./styles.module.scss";
import useLiveTemp from "../utils/querys/useLiveTemp";

interface Props {

}

export default function ActualTemp(props: Props) {
    const { data } = useLiveTemp();
    return (
        <div className={styles.actualTemp}>
            <h2>Temperatura actual</h2>
            <p>{data ?? 'x'} °C</p>
        </div>
    );
};
