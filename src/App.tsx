import { useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { ImageComponent } from "./ImageComponent";

function App() {
  const [coinName, setCoinName] = useState("");
  const [type, setType] = useState(0);
  const [loverage, setLoverage] = useState(10);
  const [inputPrice, setInputPrice] = useState("");
  const [closePrice, setClosePrice] = useState("");
  const [background, setBackground] = useState(0);
  const [dateAndTime, setDateAndTime] = useState("");

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
        <label>Беграунд:</label>

         <select value={background as number} onChange={(e) => setBackground(Number(e.target.value))}>
          <option value={0}>1</option>
          <option value={1}>2</option>
          <option value={2}>3</option>
          <option value={3}>4</option>
        </select>
      </div>

      <ImageComponent coinName={coinName} type={type} loverage={loverage} inputPrice={inputPrice} closePrice={closePrice} bgIndex={background} dateAndTime={dateAndTime} />
    </>
  );
}

export default App;
