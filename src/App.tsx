import { useEffect, useMemo, useRef, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { ImageComponent } from "./ImageComponent";
import {
  addStoredImage,
  deleteStoredImage,
  getStoredImages,
  type StoredImage,
} from "./indexedDbImages";

type UiImage = StoredImage & { previewUrl: string };

function App() {
  const [coinName, setCoinName] = useState("");
  const [type, setType] = useState(0);
  const [loverage, setLoverage] = useState(10);
  const [inputPrice, setInputPrice] = useState("");
  const [closePrice, setClosePrice] = useState("");
  const [backgroundId, setBackgroundId] = useState<number | null>(null);
  const [dateAndTime, setDateAndTime] = useState("");
  const [images, setImages] = useState<UiImage[]>([]);
  const previewUrlsRef = useRef<Map<number, string>>(new Map());

  const selectedBackgroundUrl = useMemo(() => {
    return images.find((image) => image.id === backgroundId)?.previewUrl;
  }, [images, backgroundId]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    void loadImages();

    return () => {
      for (const url of previewUrls.values()) {
        URL.revokeObjectURL(url);
      }
      previewUrls.clear();
    };
  }, []);

  async function loadImages() {
    const storedImages = await getStoredImages();

    const next = storedImages.map((image) => {
      const existingUrl = previewUrlsRef.current.get(image.id);
      const previewUrl = existingUrl ?? URL.createObjectURL(image.blob);

      if (!existingUrl) {
        previewUrlsRef.current.set(image.id, previewUrl);
      }

      return {
        ...image,
        previewUrl,
      };
    });

    const nextIds = new Set(next.map((image) => image.id));

    for (const [id, url] of previewUrlsRef.current.entries()) {
      if (!nextIds.has(id)) {
        URL.revokeObjectURL(url);
        previewUrlsRef.current.delete(id);
      }
    }

    setImages(next);
    setBackgroundId((current) => {
      if (current !== null && next.some((image) => image.id === current)) {
        return current;
      }

      return next[0]?.id ?? null;
    });
  }

  async function handleUploadBackgrounds(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

    await Promise.all(imageFiles.map((file) => addStoredImage(file)));
    await loadImages();

    event.target.value = "";
  }

  async function handleDeleteSelectedBackground() {
    if (backgroundId === null) {
      return;
    }

    await deleteStoredImage(backgroundId);
    await loadImages();
  }

  return (
    <>
      <h1>Vovastik</h1>
      
      <div className="form-row">
        <label>Назва монети:</label>
        <input
          type="text"
          placeholder="BTC/USDT"
          value={coinName as string}
          onChange={(e) => setCoinName(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Тип:</label>
        <select value={type as number} onChange={(e) => setType(Number(e.target.value))}>
          <option value={0}>Лонг</option>
          <option value={1}>Шорт</option>
        </select>
      </div>

      <div className="form-row">
        <label>Плече:</label>
        <input
          type="text"
          placeholder="30"
          value={loverage as number}
          onChange={(e) => setLoverage(Number(e.target.value))}
        />
      </div>

      <div className="form-row">
        <label>Ціна входу:</label>
        <input
          type="text"
          placeholder="0.001"
          value={inputPrice as string}
          onChange={(e) => setInputPrice(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Ціна закриття:</label>
        <input
          type="text"
          placeholder="0.001"
          value={closePrice as string}
          onChange={(e) => setClosePrice(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Дата і час:</label>
        <input
          type="text"
          placeholder="2025-09-26 19:14:48"
          value={dateAndTime as string}
          onChange={(e) => setDateAndTime(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const pad = (n: number) => n.toString().padStart(2, "0");
            const formatted =
              now.getFullYear() +
              "-" +
              pad(now.getMonth() + 1) +
              "-" +
              pad(now.getDate()) +
              "  " +
              pad(now.getHours()) +
              ":" +
              pad(now.getMinutes()) +
              ":" +
              pad(now.getSeconds());
            setDateAndTime(formatted);
          }}
          style={{ padding: "6px 12px" }}
        >
          Поточна
        </button>
      </div>

      <div className="form-row">
        <label>Фони:</label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUploadBackgrounds}
        />
      </div>

      <div className="form-row">
        <label>Беграунд:</label>

         <select
          value={backgroundId ?? ""}
          onChange={(e) => setBackgroundId(Number(e.target.value))}
          disabled={images.length === 0}
        >
          {images.length === 0 ? (
            <option value="">Немає завантажених фонів</option>
          ) : (
            images.map((image, index) => (
            <option key={image.id} value={image.id}>
              {index + 1}. {image.name}
            </option>
            ))
          )}
        </select>

        <button type="button" onClick={handleDeleteSelectedBackground} disabled={backgroundId === null}>
          Видалити
        </button>
      </div>

      <ImageComponent
        coinName={coinName}
        type={type}
        loverage={loverage}
        inputPrice={inputPrice}
        closePrice={closePrice}
        backgroundUrl={selectedBackgroundUrl}
        dateAndTime={dateAndTime}
      />
    </>
  );
}

export default App;
