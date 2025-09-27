import { useEffect, useRef, useState } from "react";
import { images } from "./images";
import {
  Application,
  Assets,
  Sprite,
  TextStyle,
  Text,
  Rectangle,
  Graphics,
} from "pixi.js";
import logo from "./assets/logo_latest_poster.d11a5ee.svg";
import { percentPnL } from "./utils";

type ImageComponentProps = {
  coinName: string;
  type: number;
  loverage: number;
  inputPrice: string;
  closePrice: string;
  bgIndex: number;
  dateAndTime: string
};

export function ImageComponent({
  coinName,
  type,
  loverage,
  inputPrice,
  closePrice,
  bgIndex,
  dateAndTime
}: ImageComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new Application();
    app
      .init({
        background: "#000000",
        width: 960,
        height: 1070,
        resolution: window.devicePixelRatio,
        antialias: true,
      })
      .then(() => {
        setApp(app);
      });
  }, []);

  useEffect(() => {
    if (!app) {
      return;
    }

    const f = async () => {
      await document.fonts.ready;
      app.stage.removeChildren();
      //@ts-expect-error
      globalThis.__PIXI_APP__ = app;
      if (!containerRef.current) {
        return;
      }
      containerRef.current.appendChild(app.canvas as HTMLCanvasElement);

      const texture = await base64ToTexture(images[bgIndex]);
      const background = new Sprite(texture);
      background.zIndex = -1;
      const logoTexture = await Assets.load(logo); // logo = URL до svg
      const sprite = new Sprite(logoTexture);
      sprite.position.set(49, 53);
      sprite.scale.set(0.62);

      //Currecy Text
      const currencyTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 49,
        fontWeight: "400",
        fill: "#ffffff",
      });

      const currencyText = new Text({
        text: coinName,
        style: currencyTextStyle,
      });
      currencyText.position.set(50, 227);

      //Perp Text
      const perpTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 35,
        fontWeight: "400",
        fill: "#ffffff",
      });

      const perpText = new Text({
        text: "Perp",
        style: perpTextStyle,
      });
      perpText.position.set(currencyText.x + currencyText.width + 39, 235);
      perpText.zIndex = 2;
      const rect = new Graphics()
        .fill("#282828")
        .drawRoundedRect(
          perpText.x - 15,
          perpText.y + 3,
          perpText.width + 30,
          perpText.height,
          12
        )
        .endFill();

      //Type Text
      const typeTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 36,
        fontWeight: "400",
        fill: !type ? "#24c18d" : "#f14b3f",
      });

      const typeText = new Text({
        text: !type ? "Лонг позиция" : "Шорт позиция",
        style: typeTextStyle,
      });
      typeText.position.set(50, 309);

      //Divider
      const dividerTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 36,
        fontWeight: "400",
        fill: "#8b8b8e",
      });

      const dividerText = new Text({
        text: "    |    ",
        style: dividerTextStyle,
      });
      dividerText.position.set(typeText.width + typeText.x, 309);

      //Multiplier
      const multiplierTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 36,
        fontWeight: "400",
        fill: "#ffffff",
      });

      const multiplierText = new Text({
        text: `${loverage}x`,
        style: multiplierTextStyle,
      });
      multiplierText.position.set(dividerText.width + dividerText.x, 309);

      let pnl = 1;

      if (inputPrice && closePrice) {
        pnl = percentPnL(
          Number(inputPrice.replace(",", ".")),
          Number(closePrice.replace(",", ".")),
          type,
          loverage
        );
      }

      let pnlColor = "";
      if (pnl > 0) {
        pnlColor = "#24c18d";
      } else {
        pnlColor = "#f14b3f";
      }

      //PNL Text
      const pnlTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 98,
        fontWeight: "500",
        fill: pnlColor,
      });

      const pnlText = new Text({
        text: pnl > 0 ? `+${pnl.toFixed(2) + "%"}` : pnl.toFixed(2) + "%",
        style: pnlTextStyle,
      });
      pnlText.position.set(49, 378);

      //Gray
      const grayTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 38,
        fontWeight: "300",
        fill: "#8b8b8e",
      });

      const whiteTextStyle = new TextStyle({
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 38,
        fontWeight: "300",
        fill: "#ffffff",
      });

      const introLabelText = new Text({
        text: "Цена входа  ",
        style: grayTextStyle,
      });
      introLabelText.position.set(50, 868);

      const introText = new Text({
        text: inputPrice,
        style: whiteTextStyle,
      });
      introText.position.set(introLabelText.width + introLabelText.x, 868);

      const outroLabelText = new Text({
        text: "Цена маркировки  ",
        style: grayTextStyle,
      });
      outroLabelText.position.set(50, 930);

      const outroText = new Text({
        text: closePrice,
        style: whiteTextStyle,
      });
      outroText.position.set(outroLabelText.width + outroLabelText.x, 930);

      const dateText = new Text({
        text: "Репост  " + dateAndTime,
        style: grayTextStyle,
      });
      dateText.position.set(50, 992);

      const children = [
        pnlText,
        typeText,
        currencyText,
        sprite,
        background,
        introLabelText,
        outroLabelText,
        introText,
        outroText,
        dateText,
        dividerText,
        multiplierText,
        perpText,
        rect,
      ];
      children.forEach((child) => app.stage.addChild(child));
    };

    f()

  }, [coinName, type, loverage, inputPrice, closePrice, bgIndex, dateAndTime, app]);

  async function downloadImage() {
    if (!app) return;

    const img = await app.renderer.extract.image({
      target: app.stage,
      format: "png",
      quality: 0.8,
      frame: new Rectangle(0, 0, 960, 1070),
      resolution: 2,
      antialias: true,
    });

    const link = document.createElement("a");
    link.download = "image.png";
    link.href = img.src;
    link.click();
  }

  return (
    <>
      <button onClick={downloadImage} style={{ margin: "12px" }}>
        Download
      </button>
      <div ref={containerRef} className="pixi-wrapper"></div>
    </>
  );
}

async function base64ToTexture(base64: string) {
  const texture = await Assets.load(base64);
  return texture;
}
