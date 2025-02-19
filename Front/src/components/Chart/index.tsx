import React from "react";
import {LineChart} from "@mui/x-charts";
import useLiveGraph from "../utils/querys/useLiveGraph";

interface Props {

}

export default function Chart({}: Props) {
    let { data } = useLiveGraph();

    // mock data for the chart
    //data = [0,1,2,3,4,5,6,7,8,9,2,3,45,6,]

    // create x axis for the chart (time from index separated by 1 second)
    const xAxis = data?.map((_, index) => index) ?? [];


    // width adjusted to the screen width
    const width = window.innerWidth;
    // calculate remaining height for the chart taking helper-height as reference to the end of the screen
    const height = window.innerHeight - (document?.getElementById('helper-height')?.offsetTop ?? 0);

    return (
        <>
            <div id="helper-height" />
            <LineChart
                xAxis={[{ data: xAxis }]}
                series={[
                    { data: data ?? [] },
                ]}
                height={height}
                width={width}
            />
        </>
    );
}