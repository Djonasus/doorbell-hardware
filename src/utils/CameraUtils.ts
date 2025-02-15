import NodeWebcam, { WebcamOptions } from "node-webcam";
import * as fs from "fs";

export async function takePhoto(title: string): Promise<string> {
    const opts: WebcamOptions = {
        // width: 1280,
        // height: 720,
        // quality: 100,
        // delay: 0,
        saveShots: false, // Не сохранять снимки на диск
        // output: "jpeg",
        // device: false,
        callbackReturn: "buffer", // Возвращать изображение в виде буфера
        verbose: false
    };
    const Webcam = NodeWebcam.create( opts );

    Webcam.capture("picture", function(err, buffer) {
        if (err) {
            console.error("Ошибка при захвате изображения:", err);
            return;
        }
    
        fs.writeFileSync("./images/"+title+'.jpg', buffer);
        // console.log("Изображение сохранено в файл ./images/"+title+'.jpg');
    });

    while (!fs.existsSync("./images/"+title+'.jpg')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return "./images/"+title+'.jpg';
}