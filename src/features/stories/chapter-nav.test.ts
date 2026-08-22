import { describe, expect, it } from "vitest";
import { adjacentChapterId } from "./chapter-nav";

const CHAPTERS = [
  { id: 10, orderNo: 1 },
  { id: 20, orderNo: 2 },
  { id: 30, orderNo: 3 },
];

describe("adjacentChapterId", () => {
  it("returns previous chapter id", () => {
    expect(adjacentChapterId(CHAPTERS, 20, "prev")).toBe(10);
  });

  it("returns next chapter id", () => {
    expect(adjacentChapterId(CHAPTERS, 20, "next")).toBe(30);
  });

  it("returns null at first chapter prev", () => {
    expect(adjacentChapterId(CHAPTERS, 10, "prev")).toBeNull();
  });

  it("returns null at last chapter next", () => {
    expect(adjacentChapterId(CHAPTERS, 30, "next")).toBeNull();
  });

  it("orders chapters by orderNo even when input is unsorted", () => {
    const shuffled = [
      { id: 30, orderNo: 3 },
      { id: 10, orderNo: 1 },
      { id: 20, orderNo: 2 },
    ];
    expect(adjacentChapterId(shuffled, 10, "next")).toBe(20);
  });

  it("returns null when current chapter is not found", () => {
    expect(adjacentChapterId(CHAPTERS, 999, "next")).toBeNull();
  });
});
