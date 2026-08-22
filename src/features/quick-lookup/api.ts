import { parseDictionaryEntry } from "./parse-dictionary";
import { parseWiktionaryDefinition } from "./parse-wiktionary";
import type { DictionaryEnSense } from "./types";
import { lookupServiceUrls } from "./urls";

export const DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en";

const LIBRETRANSLATE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LIBRETRANSLATE_URL?.trim()) ||
  "https://libretranslate.com/translate";

const LIBRETRANSLATE_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LIBRETRANSLATE_API_KEY?.trim()) ||
  "";

const DEFAULT_TIMEOUT_MS = 12_000;

function isDevBrowser(): boolean {
  return Boolean(import.meta.env?.DEV);
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDictionaryApi(word: string): Promise<DictionaryEnSense> {
  const url = lookupServiceUrls(word, isDevBrowser()).dictionary;
  const response = await fetchWithTimeout(url, { method: "GET" });
  if (response.status === 404) {
    throw new Error("Word not found");
  }
  if (!response.ok) {
    throw new Error(`Dictionary API failed (${response.status})`);
  }
  const payload: unknown = await response.json();
  return parseDictionaryEntry(payload);
}

async function fetchWiktionary(word: string): Promise<DictionaryEnSense> {
  const url = lookupServiceUrls(word, isDevBrowser()).wiktionary;
  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) {
    throw new Error("Word not found");
  }
  if (!response.ok) {
    throw new Error(`Wiktionary failed (${response.status})`);
  }
  const payload: unknown = await response.json();
  return parseWiktionaryDefinition(word, payload);
}

export async function fetchDictionaryEn(word: string): Promise<DictionaryEnSense> {
  try {
    return await fetchDictionaryApi(word);
  } catch {
    return fetchWiktionary(word);
  }
}

export async function translateWithLibre(text: string): Promise<string> {
  const response = await fetchWithTimeout(LIBRETRANSLATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: "vi",
      format: "text",
      api_key: LIBRETRANSLATE_API_KEY,
    }),
  });
  if (!response.ok) {
    throw new Error(`LibreTranslate failed (${response.status})`);
  }
  const payload = (await response.json()) as { translatedText?: string };
  const translated = payload.translatedText?.trim();
  if (!translated) {
    throw new Error("LibreTranslate returned empty translation");
  }
  return translated;
}

export async function translateWithMyMemory(text: string): Promise<string> {
  const url = lookupServiceUrls(text, isDevBrowser()).mymemory;
  const response = await fetchWithTimeout(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`MyMemory failed (${response.status})`);
  }
  const payload = (await response.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
  };
  const translated = payload.responseData?.translatedText?.trim();
  if (!translated || (payload.responseStatus != null && payload.responseStatus !== 200)) {
    throw new Error("MyMemory returned empty translation");
  }
  return translated;
}

function libreIsConfigured(): boolean {
  return Boolean(LIBRETRANSLATE_API_KEY) || Boolean(import.meta.env?.VITE_LIBRETRANSLATE_URL?.trim());
}

export async function translateToVietnamese(text: string): Promise<string> {
  if (libreIsConfigured()) {
    try {
      return await translateWithLibre(text);
    } catch {
      // Public LibreTranslate often needs a key; fall through.
    }
  }
  return translateWithMyMemory(text);
}
