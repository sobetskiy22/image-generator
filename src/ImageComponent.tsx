import { useEffect, useRef, useState } from "react";
import {
  Application,
  Assets,
  Sprite,
  Texture,
  TextStyle,
  Text,
  Rectangle,
  Graphics,
} from "pixi.js";
import { percentPnL } from "./utils";
import type { ExchangeConfig } from "./exchangeConfigs";

type ImageComponentProps = {
  exchange: ExchangeConfig;
  coinName: string;
  type: number;
  loverage: number;
  inputPrice: string;
  closePrice: string;
  backgroundUrl?: string;
  dateAndTime: string;
};

export function ImageComponent({
  exchange,
  coinName,
  type,
  loverage,
  inputPrice,
  closePrice,
  backgroundUrl,
  dateAndTime,
}: ImageComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [app, setApp] = useState<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let isDisposed = false;
    const nextApp = new Application();

    nextApp
      .init({
        background: "#000000",
        width: exchange.imageSize.width,
        height: exchange.imageSize.height,
        resolution: window.devicePixelRatio,
        antialias: true,
      })
      .then(() => {
        if (isDisposed) {
          nextApp.destroy(true);
          return;
        }
        setApp(nextApp);
      });

    return () => {
      isDisposed = true;
      nextApp.destroy(true);
      setApp(null);
    };
  }, [exchange]);

  useEffect(() => {
    if (!app) {
      return;
    }

    const render = async () => {
      await document.fonts.ready;
      app.stage.removeChildren();
      // @ts-expect-error needed for pixi app debugging handle on globalThis
      globalThis.__PIXI_APP__ = app;
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(app.canvas as HTMLCanvasElement)) {
        containerRef.current.appendChild(app.canvas as HTMLCanvasElement);
      }

      if (exchange.layout === "legacy") {
        await renderLegacyTemplate({
          app,
          exchange,
          coinName,
          type,
          loverage,
          inputPrice,
          closePrice,
          backgroundUrl,
          dateAndTime,
        });
        return;
      }

      await renderCompactTemplate({
        app,
        exchange,
        coinName,
        type,
        loverage,
        inputPrice,
        closePrice,
        backgroundUrl,
      });
    };

    void render();
  }, [coinName, type, loverage, inputPrice, closePrice, backgroundUrl, dateAndTime, app, exchange]);

  async function downloadImage() {
    if (!app) return;

    const { width, height } = exchange.imageSize;
    const img = await app.renderer.extract.image({
      target: app.stage,
      format: "png",
      quality: 0.8,
      frame: new Rectangle(0, 0, width, height),
      resolution: 2,
      antialias: true,
    });

    const link = document.createElement("a");
    link.download = exchange.downloadFileName;
    link.href = img.src;
    link.click();
  }

  async function copyImageToClipboard() {
    if (!app) return;

    const { width, height } = exchange.imageSize;
    const canvas = await app.renderer.extract.canvas({
      target: app.stage,
      frame: new Rectangle(0, 0, width, height),
      resolution: 2,
      antialias: true,
    });

    const blob: Blob | null = await new Promise((resolve) => {
      if (canvas.toBlob) {
        canvas.toBlob((nextBlob) => {
          resolve(nextBlob);
        }, "image/png", 0.8);
      }
    });

    if (!blob) return;

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
  }

  return (
    <>
      <button onClick={downloadImage} style={{ margin: "12px" }}>
        Download
      </button>
      <button onClick={copyImageToClipboard} style={{ margin: "12px" }}>
        Copy
      </button>
      <div ref={containerRef} className="pixi-wrapper"></div>
    </>
  );
}

type RenderBaseProps = {
  app: Application;
  exchange: ExchangeConfig;
  coinName: string;
  type: number;
  loverage: number;
  inputPrice: string;
  closePrice: string;
  backgroundUrl?: string;
};

type RenderLegacyProps = RenderBaseProps & {
  dateAndTime: string;
};

async function renderLegacyTemplate({
  app,
  exchange,
  coinName,
  type,
  loverage,
  inputPrice,
  closePrice,
  backgroundUrl,
  dateAndTime,
}: RenderLegacyProps) {
  const { legacy } = exchange.texts;
  const background = backgroundUrl ? await buildBackgroundSpriteLegacy(backgroundUrl) : null;
  const logoTexture = await Assets.load(exchange.logoSrc);
  const sprite = new Sprite(logoTexture);
  sprite.position.set(49, 53);
  sprite.scale.set(0.62);

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

  const perpTextStyle = new TextStyle({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 35,
    fontWeight: "400",
    fill: "#ffffff",
  });

  const perpText = new Text({
    text: legacy.perp,
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

  const typeTextStyle = new TextStyle({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 36,
    fontWeight: "400",
    fill: type === 0 ? "#24c18d" : "#f14b3f",
  });

  const typeText = new Text({
    text: type === 0 ? legacy.side.long : legacy.side.short,
    style: typeTextStyle,
  });
  typeText.position.set(50, 309);

  const dividerTextStyle = new TextStyle({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 36,
    fontWeight: "400",
    fill: "#8b8b8e",
  });

  const dividerText = new Text({
    text: legacy.divider,
    style: dividerTextStyle,
  });
  dividerText.position.set(typeText.width + typeText.x, 309);

  const multiplierTextStyle = new TextStyle({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 36,
    fontWeight: "400",
    fill: "#ffffff",
  });

  const multiplierText = new Text({
    text: legacy.leverage(loverage),
    style: multiplierTextStyle,
  });
  multiplierText.position.set(dividerText.width + dividerText.x, 309);

  const pnl = getPnl(inputPrice, closePrice, type, loverage);
  const pnlColor = pnl > 0 ? "#24c18d" : "#f14b3f";

  const pnlTextStyle = new TextStyle({
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 98,
    fontWeight: "500",
    fill: pnlColor,
  });

  const pnlText = new Text({
    text: formatPercentTruncated(pnl),
    style: pnlTextStyle,
  });
  pnlText.position.set(49, 378);

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
    text: legacy.entryPriceLabel,
    style: grayTextStyle,
  });
  introLabelText.position.set(50, 868);

  const introText = new Text({
    text: inputPrice,
    style: whiteTextStyle,
  });
  introText.position.set(introLabelText.width + introLabelText.x, 868);

  const outroLabelText = new Text({
    text: legacy.markPriceLabel,
    style: grayTextStyle,
  });
  outroLabelText.position.set(50, 930);

  const outroText = new Text({
    text: closePrice,
    style: whiteTextStyle,
  });
  outroText.position.set(outroLabelText.width + outroLabelText.x, 930);

  const dateText = new Text({
    text: legacy.repostWithDate(dateAndTime),
    style: grayTextStyle,
  });
  dateText.position.set(50, 992);

  const children = [
    pnlText,
    typeText,
    currencyText,
    sprite,
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

  if (background) {
    children.unshift(background);
  }

  children.forEach((child) => app.stage.addChild(child));
}

async function renderCompactTemplate({
  app,
  exchange,
  coinName,
  type,
  loverage,
  inputPrice,
  closePrice,
  backgroundUrl,
}: RenderBaseProps) {
  const compactFontFamily = 'HarmonyOS EnNumber, -apple-system, BlinkMacSystemFont, sans-serif';
  await Promise.all([
    document.fonts.load('400 16px "HarmonyOS EnNumber"'),
    document.fonts.load('500 16px "HarmonyOS EnNumber"'),
    document.fonts.load('600 16px "HarmonyOS EnNumber"'),
    document.fonts.load('700 16px "HarmonyOS EnNumber"'),
  ]);
  const { compact } = exchange.texts;
  const { width, height } = exchange.imageSize;
  const background = backgroundUrl
    ? await buildBackgroundSpriteCompact(backgroundUrl, width, height)
    : null;

  const logoTexture = await Assets.load(exchange.logoSrc);
  const logoSprite = new Sprite(logoTexture);
  logoSprite.position.set(50, 48);
  logoSprite.scale.set(0.37);

  const mainTitleStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 34.5,
    fontWeight: "400",
    fill: "#ffffff",
  });

  const rowMainStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 43.5,
    fontWeight: "600",
    fill: "#ffffff",
  });

  const rowSeparatorStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 35,
    fontWeight: "normal",
    fill: "#6d7384",
  });

  const rowSideStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 43.5,
    fontWeight: "700",
    fill: type === 0 ? "#00e28a" : "#f14b3f",
  });

  const grayStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 32,
    fontWeight: "400",
    fill: "#7f8596",
  });

  const valueStyle = new TextStyle({
    fontFamily: compactFontFamily,
    fontSize: 32,
    fontWeight: "500",
    fill: "#ffffff",
  });

  const pnlTitle = new Text({
    text: compact.unrealizedPnL,
    style: mainTitleStyle,
  });
  pnlTitle.position.set(48, 213);

  const sideText = type === 0 ? compact.side.long : compact.side.short;
  const compactPair = compact.normalizePair(coinName || compact.defaultPair);
  const leverageText = compact.leverage(loverage);

  const pairText = new Text({
    text: compactPair,
    style: rowMainStyle,
  });
  pairText.position.set(48, 278);

  const separatorLeftText = new Text({
    text: compact.separator,
    style: rowSeparatorStyle,
  });
  separatorLeftText.position.set(pairText.x + pairText.width + 35, 280.5);

  const sideValueText = new Text({
    text: sideText,
    style: rowSideStyle,
  });
  sideValueText.position.set(separatorLeftText.x + separatorLeftText.width + 12, 278);

  const separatorRightText = new Text({
    text: compact.separator,
    style: rowSeparatorStyle,
  });
  separatorRightText.position.set(sideValueText.x + sideValueText.width + 14, 280.5);

  const leverageValueText = new Text({
    text: leverageText,
    style: rowMainStyle,
  });
  leverageValueText.position.set(separatorRightText.x + separatorRightText.width + 6, 278);

  const profitTitle = new Text({
    text: compact.profitability,
    style: grayStyle,
  });
  profitTitle.position.set(48, 377);

  const profitSubtitle = compact.profitabilityPercent
    ? new Text({
        text: compact.profitabilityPercent,
        style: new TextStyle({
          ...grayStyle,
          fontSize: 34,
        }),
      })
    : null;
  if (profitSubtitle) {
    profitSubtitle.position.set(48, 486);
  }

  const pnlSigned = getPnl(inputPrice, closePrice, type, loverage);
  const pnlColor = pnlSigned >= 0 ? "#24c18d" : "#f14b3f";
  const pnlText = new Text({
    text: formatPercentTruncated(pnlSigned),
    style: new TextStyle({
      fontFamily: compactFontFamily,
      fontSize: 125,
      fontWeight: "500",
      fill: pnlColor,
    }),
  });
  pnlText.position.set(46, profitSubtitle ? 530 : 420);

  const lastPriceLabel = new Text({
    text: compact.lastPrice,
    style: new TextStyle({
      ...grayStyle,
      fontSize: 58,
      fontWeight: "400",
    }),
  });
  lastPriceLabel.position.set(48, height - 176);

  const lastPriceValue = new Text({
    text: formatDisplayPrice(closePrice, compact.emptyValue),
    style: valueStyle
  });
  lastPriceValue.position.set(lastPriceLabel.x + lastPriceLabel.width + 50, height - 176);

  const entryPriceLabel = new Text({
    text: compact.entryPrice,
    style: new TextStyle({
      ...grayStyle,
      fontSize: 58,
      fontWeight: "400",
    }),
  });
  entryPriceLabel.position.set(48, height - 115);

  const entryPriceValue = new Text({
    text: formatDisplayPrice(inputPrice, compact.emptyValue),
    style: valueStyle
  });
  entryPriceValue.position.set(entryPriceLabel.x + entryPriceLabel.width + 44, height - 115);

  const children = [
    logoSprite,
    pnlTitle,
    pairText,
    separatorLeftText,
    sideValueText,
    separatorRightText,
    leverageValueText,
    profitTitle,
    pnlText,
    lastPriceLabel,
    lastPriceValue,
    entryPriceLabel,
    entryPriceValue,
  ];

  if (profitSubtitle) {
    children.push(profitSubtitle);
  }

  if (background) {
    children.unshift(background);
  }

  children.forEach((child) => app.stage.addChild(child));
}

type GetPnlOptions = {
  unsigned?: boolean;
};

type FormatPercentOptions = {
  unsigned?: boolean;
};

function getPnl(
  inputPrice: string,
  closePrice: string,
  type: number,
  loverage: number,
  options: GetPnlOptions = {}
): number {
  if (!inputPrice || !closePrice) {
    return 0;
  }

  const pnl = percentPnL(
    Number(inputPrice.replace(",", ".")),
    Number(closePrice.replace(",", ".")),
    type,
    loverage
  );

  if (options.unsigned) {
    return Math.abs(pnl);
  }

  return pnl;
}

function formatPercentTruncated(value: number, options: FormatPercentOptions = {}): string {
  const abs = Math.abs(value);
  const truncated = Math.floor(abs * 100) / 100;
  const formatted = truncated.toFixed(2);

  if (options.unsigned) {
    return `${formatted}%`;
  }

  if (value > 0) {
    return `+${formatted}%`;
  }

  if (value < 0) {
    return `-${formatted}%`;
  }

  return `${formatted}%`;
}

function formatDisplayPrice(value: string, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
  if (!normalized) {
    return fallback;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) {
    return value;
  }

  const decimalPart = normalized.includes(".") ? normalized.split(".")[1] : "";
  const fractionDigits = decimalPart.length;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numeric);
}

async function buildBackgroundSpriteLegacy(backgroundUrl: string): Promise<Sprite | null> {
  try {
    const texture = await loadTextureFromUrl(backgroundUrl);

    if (!texture) {
      return null;
    }

    const background = new Sprite(texture);
    background.zIndex = -1;
    return background;
  } catch (error) {
    console.error("Failed to load background texture", error);
    return null;
  }
}

async function buildBackgroundSpriteCompact(
  backgroundUrl: string,
  targetWidth: number,
  targetHeight: number
): Promise<Sprite | null> {
  try {
    const texture = await loadTextureFromUrl(backgroundUrl);

    if (!texture) {
      return null;
    }

    const sprite = new Sprite(texture);
    const sourceWidth = texture.width;
    const sourceHeight = texture.height;

    if (sourceWidth <= 0 || sourceHeight <= 0) {
      return null;
    }

    const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
    sprite.width = sourceWidth * scale;
    sprite.height = sourceHeight * scale;
    sprite.x = 0
    sprite.y = 0
    sprite.zIndex = -1;

    return sprite;
  } catch (error) {
    console.error("Failed to load background texture", error);
    return null;
  }
}

async function loadTextureFromUrl(url: string): Promise<Texture | null> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const texture = Texture.from(image);
      resolve(texture);
    };

    image.onerror = () => {
      resolve(null);
    };

    image.src = url;
  });
}
