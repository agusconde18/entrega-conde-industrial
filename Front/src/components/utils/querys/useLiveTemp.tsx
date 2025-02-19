import {useQuery} from "react-query";
import {API_URL, URL_BASE} from "../api";
import {useEffect} from "react";

export default function useLiveTemp() {
    const query = useQuery(API_URL.liveTemp, async (): Promise<{ temp: number }> => {
        const response = await fetch(URL_BASE + API_URL.liveTemp);
        return response.json();
    }, {
        retry: false,
        enabled: false
    });

    useEffect(() => {
        // auto refresh after 5 seconds
        const interval = setInterval(() => {
            query.refetch();
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    
    return {
        ...query,
        isLoading: false,
        data: query.data?.temp
    }
}