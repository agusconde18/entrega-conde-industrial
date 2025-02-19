import {useQuery} from "react-query";
import {API_URL, URL_BASE} from "../api";
import {useEffect} from "react";

export default function useChangeTemp({temp}: {temp: number}) {
    const query = useQuery(API_URL.changeTemp, async (): Promise<void> => {
        // send temp as form-data post
        const formData = new FormData();
        formData.append('temp', temp.toString());
        await fetch(URL_BASE + API_URL.changeTemp, {
            method: 'POST',
            body: formData
        });
    }, {
        retry: false,
        enabled: false
    });

    // If the temp changes, we want to refetch the data
    useEffect(() => {
        query.refetch();
    }, [temp]);
    
    return {
        ...query,
        isLoading: false,
        data: query.data
    }
}