// GitHub driver: where an upload lands. The upload API passes a directory
// plus `filename`; WebDAV PUT and cross-storage copies pass the full file
// path (whose last segment is `filename`) and must not be nested as a/a.
import assert from "node:assert/strict";
import { test } from "node:test";
import { GithubApiStorageDriver } from "../src/storage/drivers/github/GithubApiStorageDriver.js";

const driver = Object.create(GithubApiStorageDriver.prototype);
const resolve = (subPath, fsPath, filename) =>
  driver._resolveTargetSubPath(driver._normalizeSubPath(subPath), fsPath, filename, subPath);

test("WebDAV PUT of a full file path is stored at that path, not nested", () => {
  // put.js: fileSystem.uploadFile("/g1/post_drafts/posts/img.png", …, { filename: "img.png" })
  assert.equal(resolve("/post_drafts/posts/img.png", "/g1/post_drafts/posts/img.png", "img.png"), "/post_drafts/posts/img.png");
  assert.equal(resolve("/img.png", "/g1/img.png", "img.png"), "/img.png");
});

test("uploads into a directory still get the file name appended", () => {
  assert.equal(resolve("/docs", "/g1/docs", "report.pdf"), "/docs/report.pdf");
  assert.equal(resolve("/docs/", "/g1/docs/", "report.pdf"), "/docs/report.pdf");
  assert.equal(resolve("/", "/g1/", "report.pdf"), "/report.pdf");
  assert.equal(resolve("", "/g1", "report.pdf"), "/report.pdf");
});

test("a directory explicitly marked with a trailing slash is a directory, even if named like the file", () => {
  assert.equal(resolve("/report.pdf/", "/g1/report.pdf/", "report.pdf"), "/report.pdf/report.pdf");
});

test("without a filename the path is the file", () => {
  assert.equal(resolve("/a/b.txt", "/g1/a/b.txt", undefined), "/a/b.txt");
});
