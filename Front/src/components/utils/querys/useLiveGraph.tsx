import {useQuery} from "react-query";
import {API_URL, URL_BASE} from "../api";
import {useEffect} from "react";

export default function useLiveGraph() {
    const query = useQuery(API_URL.liveGraph, async (): Promise<number []> => {
        const response = await fetch(URL_BASE + API_URL.liveGraph);
        return response.json();
    }, {
        retry: false,
        enabled: false
    });

    /*query.data = {
        data: {
            series: [{temperature: 10, timestamp: 1000}, {temperature: 20, timestamp: 2000}, {temperature: 30, timestamp: 3000}, {temperature: 40, timestamp: 4000}, {temperature: 50, timestamp: 5000}, {temperature: 60, timestamp: 6000}, {temperature: 70, timestamp: 7000}, {temperature: 80, timestamp: 8000}, {temperature: 90, timestamp: 9000}, {temperature: 100, timestamp: 10000}, {temperature: 99, timestamp: 11200}, {temperature: 98, timestamp: 12400}, {temperature: 97, timestamp: 13600}, {temperature: 96, timestamp: 14800}, {temperature: 95, timestamp: 16000}, {temperature: 94, timestamp: 17200}, {temperature: 93, timestamp: 18400}, {temperature: 92, timestamp: 19600}, {temperature: 91, timestamp: 20800}, {temperature: 90, timestamp: 22000}, {temperature: 89, timestamp: 23200}, {temperature: 88, timestamp: 24400}, {temperature: 87, timestamp: 25600}, {temperature: 86, timestamp: 26800}, {temperature: 85, timestamp: 28000}, {temperature: 84, timestamp: 29200}, {temperature: 83, timestamp: 30400}, {temperature: 82, timestamp: 31600}, {temperature: 81, timestamp: 32800}, {temperature: 80, timestamp: 34000}, {temperature: 79, timestamp: 35200}, {temperature: 78, timestamp: 36400}, {temperature: 77, timestamp: 37600}, {temperature: 76, timestamp: 38800}, {temperature: 75, timestamp: 40000}, {temperature: 74, timestamp: 41200}, {temperature: 73, timestamp: 42400}, {temperature: 72, timestamp: 43600}, {temperature: 71, timestamp: 44800}, {temperature: 70, timestamp: 46000}, {temperature: 69, timestamp: 47200}, {temperature: 68, timestamp: 48400}, {temperature: 67, timestamp: 49600}, {temperature: 66, timestamp: 50800}, {temperature: 65, timestamp: 52000}, {temperature: 64, timestamp: 53200}, {temperature: 63, timestamp: 54400}, {temperature: 62, timestamp: 55600}, {temperature: 61, timestamp: 56800}, {temperature: 60, timestamp: 58000}, {temperature: 59, timestamp: 59200}, {temperature: 58, timestamp: 60400}, {temperature: 57, timestamp: 61600}, {temperature: 56, timestamp: 62800}, {temperature: 55, timestamp: 64000}, {temperature: 54, timestamp: 65200}, {temperature: 53, timestamp: 66400}, {temperature: 52, timestamp: 67600}, {temperature: 51, timestamp: 68800}, {temperature: 50, timestamp: 70000}, {temperature: 49, timestamp: 71200}, {temperature: 48, timestamp: 72400}, {temperature: 47, timestamp: 73600}, {temperature: 46, timestamp: 74800}, {temperature: 45, timestamp: 76000}, {temperature: 44, timestamp: 77200}, {temperature: 43, timestamp: 78400}, {temperature: 42, timestamp: 79600}, {temperature: 41, timestamp: 80800}, {temperature: 40, timestamp: 82000}, {temperature: 39, timestamp: 83200}, {temperature: 38, timestamp: 84400}, {temperature: 37, timestamp: 85600}, {temperature: 36, timestamp: 86800}, {temperature: 35, timestamp: 88000}, {temperature: 34, timestamp: 89200}, {temperature: 33, timestamp: 90400}, {temperature: 32, timestamp: 91600}, {temperature: 31, timestamp: 92800}, {temperature: 30, timestamp: 94000}, {temperature: 29, timestamp: 95200}, {temperature: 28, timestamp: 96400}, {temperature: 27, timestamp: 97600}, {temperature: 26, timestamp: 98800}, {temperature: 25, timestamp: 100000}, {temperature: 24, timestamp: 101200}, {temperature: 23, timestamp: 102400}, {temperature: 22, timestamp: 103600}, {temperature: 21, timestamp: 104800}, {temperature: 20, timestamp: 106000}, {temperature: 19, timestamp: 107200}, {temperature: 18, timestamp: 108400}, {temperature: 17, timestamp: 109600}, {temperature: 16, timestamp: 110800}]
        }
    }

     */

    useEffect(() => {
        // auto refresh after 5 seconds
        const interval = setInterval(() => {
            query.refetch();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return {
        ...query,
        isLoading: false,
        data: query.data
    }
}