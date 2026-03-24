import logo from "./assets/logo_latest_poster.d11a5ee.svg";
import logo2 from "./assets/logo2.svg";

export type ExchangeKey = "weex" | "bingx";

type SideKey = "long" | "short";

export type ExchangeTextConfig = {
  compact: {
    unrealizedPnL: string;
    profitability: string;
    profitabilityPercent: string;
    lastPrice: string;
    entryPrice: string;
    defaultPair: string;
    side: Record<SideKey, string>;
    separator: string;
    normalizePair: (pair: string) => string;
    leverage: (value: number) => string;
    pairWithSideAndLeverage: (pair: string, side: string, leverage: number) => string;
    percent: (value: number) => string;
    emptyValue: string;
  };
  legacy: {
    perp: string;
    side: Record<SideKey, string>;
    divider: string;
    leverage: (value: number) => string;
    pnlPercent: (value: number) => string;
    entryPriceLabel: string;
    markPriceLabel: string;
    repostWithDate: (value: string) => string;
  };
};

export type ExchangeConfig = {
  key: ExchangeKey;
  title: string;
  logoSrc: string;
  layout: "legacy" | "compact";
  downloadFileName: string;
  imageSize: {
    width: number;
    height: number;
  };
  texts: ExchangeTextConfig;
};

const defaultImageSize = {
  width: 960,
  height: 772,
};

const legacyImageSize = {
  width: 960,
  height: 1070,
};

export const EXCHANGE_CONFIGS: Record<ExchangeKey, ExchangeConfig> = {
  weex: {
    key: "weex",
    title: "WEEX",
    logoSrc: logo,
    layout: "legacy",
    downloadFileName: "image.png",
    imageSize: legacyImageSize,
    texts: {
      compact: {
        unrealizedPnL: "Нереализованная П/У",
        profitability: "Доходность",
        profitabilityPercent: "відсоток дохідності",
        lastPrice: "Последняя цена",
        entryPrice: "Цена входа",
        defaultPair: "BTCUSDT",
        side: {
          long: "Лонг",
          short: "Шорт",
        },
        separator: " | ",
        normalizePair: (pair) => pair.replaceAll("/", "").toUpperCase(),
        leverage: (value) => `${value}X`,
        pairWithSideAndLeverage: (pair, side, leverage) => `${pair} | ${side} | ${leverage}X`,
        percent: (value) => (value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`),
        emptyValue: "-",
      },
      legacy: {
        perp: "Perp",
        side: {
          long: "Лонг позиция",
          short: "Шорт позиция",
        },
        divider: "    |    ",
        leverage: (value) => `${value}x`,
        pnlPercent: (value) => (value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`),
        entryPriceLabel: "Цена входа  ",
        markPriceLabel: "Цена маркировки  ",
        repostWithDate: (value) => "Репост  " + value,
      },
    },
  },
  bingx: {
    key: "bingx",
    title: "BingX",
    logoSrc: logo2,
    layout: "compact",
    downloadFileName: "bingx-image.png",
    imageSize: defaultImageSize,
    texts: {
      compact: {
        unrealizedPnL: "Нереализованная П/У",
        profitability: "Доходность",
        profitabilityPercent: "",
        lastPrice: "Последняя цена",
        entryPrice: "Цена входа",
        defaultPair: "BTCUSDT",
        side: {
          long: "Лонг",
          short: "Шорт",
        },
        separator: " | ",
        normalizePair: (pair) => pair.replaceAll("/", "").toUpperCase(),
        leverage: (value) => `${value}X`,
        pairWithSideAndLeverage: (pair, side, leverage) => `${pair} | ${side} | ${leverage}X`,
        percent: (value) => (value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`),
        emptyValue: "-",
      },
      legacy: {
        perp: "Perp",
        side: {
          long: "Лонг позиция",
          short: "Шорт позиция",
        },
        divider: "    |    ",
        leverage: (value) => `${value}x`,
        pnlPercent: (value) => (value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`),
        entryPriceLabel: "Цена входа  ",
        markPriceLabel: "Цена маркировки  ",
        repostWithDate: (value) => "Репост  " + value,
      },
    },
  },
};

export const EXCHANGE_ORDER: ExchangeKey[] = ["weex", "bingx"];
export const DEFAULT_EXCHANGE_KEY: ExchangeKey = "weex";