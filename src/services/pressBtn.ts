import { Button } from "../models/button";
import { ConfigManager } from "../store/configManager";
import { takePhoto } from "../utils/CameraUtils";
import { ApiService } from "./apiService";

function findButton(configs: Button[], btn: string): any {
    for (const config of configs) {
        if (config.buttonLabel === btn) {
            return config;
        }
    }
    return null;
}

export async function pressButton(sendCtx: any, btn: string) {
    const curTime = new Date().getTime().toString();
    const configs = ConfigManager.deserialize<Button[]>("buttons");

    const btnConf = findButton(configs as Button[], btn)

    if (btnConf === null) {
        sendCtx("blabla");
        return;
    }

    const photoDir = await takePhoto(curTime);
    ApiService.sendData(btnConf, photoDir, sendCtx);
    // sendCtx("startup");
    
}