export const rellenarCerosIzquierda = (numero: number | string, longitud: number): string => {
    if(typeof numero === "number") {
        numero = numero.toString();
    }
    return numero.padStart(longitud, "0");
}