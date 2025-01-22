import fs from 'fs';
import { Config } from './config';
import { ReadlineParser, SerialPort } from 'serialport';
import { NodeWebcam } from 'node-webcam';


if (!fs.existsSync(Config.photosDir)) {
    fs.mkdirSync(Config.photosDir);
}

const port = new SerialPort({ path: Config.serialPort, baudRate: Config.baudRate });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Переменная для задержки между нажатиями
let cooldown: Date = new Date();

// Инициализация камеры
const Webcam = NodeWebcam.create({
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "png",
    device: Config.cameraDevice,
    callbackReturn: "location",
});

// Отправляем "startup" на Arduino после инициализации порта
port.on("open", () => {
    console.log("Serial port opened. Sending 'startup' to Arduino...");
    port.write("startup\n", (err) => {
      if (err) {
        console.error("Error sending 'startup' to Arduino:", err.message);
      } else {
        console.log("'startup' sent to Arduino.");
      }
    });
});

// Обработка данных с Arduino
parser.on("data", async (data: string) => {
    const buttonLabel = data.trim();
  
    // Проверяем, что кнопка нажата и задержка истекла
    if (new Date() > cooldown) {
      cooldown = new Date(Date.now() + 6000); // 6 секунд задержки
      console.log(`Button pressed: ${buttonLabel}`);
  
      // Создаем имя файла на основе текущего времени
      const filePath = `${Config.photosDir}/${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
  
      try {
        // Делаем фотографию
        await takePicture(filePath);
        console.log(`Photo saved: ${filePath}`);
  
        // Отправляем фотографию на сервер
        await sendPhoto(filePath);
        console.log(`Photo sent: ${filePath}`);
  
        // Удаляем фотографию после успешной отправки
        fs.unlinkSync(filePath);
      } catch (err: Error | any) {
        console.error(`Error: ${err.message}`);
      }
    } else {
      console.log("Button press ignored: cooldown active");
    }
});

// Функция для захвата фотографии
function takePicture(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Webcam.capture(filePath, (err: Error | null) => {
        if (err) {
          reject(new Error(`Failed to take picture: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
}

// Функция для отправки фотографии на сервер
async function sendPhoto(filePath: string): Promise<void> {
    try {
      const photoData = fs.readFileSync(filePath);
      const response = await fetch(Config.hostAddress, {
        method: "POST",
        body: photoData,
        headers: { "Content-Type": "image/png" },
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
    } catch (err: Error | any) {
      throw new Error(`Failed to send photo: ${err.message}`);
    }
}

// Проверка неотправленных фотографий каждые 15 минут
setInterval(async () => {
    const files = fs.readdirSync(Config.photosDir);
    for (const file of files) {
      const filePath = `${Config.photosDir}/${file}`;
      try {
        await sendPhoto(filePath);
        console.log(`Photo sent from pool: ${filePath}`);
        fs.unlinkSync(filePath); // Удаляем фото после успешной отправки
      } catch (err: Error | any) {
        console.error(`Failed to send photo from pool: ${err.message}`);
      }
    }
}, 15 * 60 * 1000); // 15 минут
  
  console.log("Doorbell system started!");