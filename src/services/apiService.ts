import * as fs from "fs";
import { GlobalConfig } from "../models/config";
import { Button } from "../models/button";
import { ConfigManager } from "../store/configManager";
import * as axios from "axios";

export namespace ApiService {
    export interface ApiDTO {
        image: Buffer,
        time: string,
        floorId: string,
    }

    export async function sendData(btnData: Button, imagePath: string, sendCtx: any) {
        const gc = ConfigManager.deserialize<GlobalConfig>("GlobalConfig")
        const hostAddress = gc?.hostAddress || "http://localhost:8000";

        const httpClient = axios.create({
            // baseURL: hostAddress,
            timeout: 4000,
        });

        const image = fs.readFileSync(imagePath);
        const data: ApiDTO = {
            image: image,
            time: new Date().toISOString(),
            floorId: btnData.roofId,
        };
        httpClient.post(`${hostAddress}/api/new_call`, data)
            .then(response => {
                console.log('Data sent successfully:', response.data);
                fs.rmSync(imagePath);
            })
            .catch(error => {
                sendCtx("error");
                console.error('Error sending data:', error.response?.status ?? "Server is not responding");
            });
    }
}