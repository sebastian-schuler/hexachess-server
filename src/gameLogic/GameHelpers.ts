import { Coords } from "../types/SharedTypes";

export const coordinatesToId = (coords: Coords) => {
    return `${coords.q};${coords.r};${coords.s}`;
}