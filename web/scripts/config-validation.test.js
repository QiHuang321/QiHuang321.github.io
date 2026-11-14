import test from "node:test";
import assert from "node:assert/strict";
import { loadConfigs, validateConfigs } from "./config-validation.js";
import { parseConfig } from "../src/utils/parseConfig.js";

test("current configuration and asset references are valid", () => {
  assert.deepEqual(validateConfigs(loadConfigs()), []);
});
test("JSONC supports comments without corrupting strings", () => {
  const source = '{ // heading\n "url": "https://example.com/*keep*/", /* note */ "value": 1 }';
  assert.equal(parseConfig(source, "theme.jsonc", true).url, "https://example.com/*keep*/");
  assert.throws(() => parseConfig(source, "content.json"), /content.json:1:/);
  assert.throws(() => parseConfig('{"value":}', "broken.json"), /broken.json:1:/);
});
test("missing required fields report their file and location", () => {
  const config = loadConfigs();
  delete config["hero.json"].primaryLinks;
  assert.match(validateConfigs(config).join("\n"), /hero.json.*primaryLinks/);
});
test("duplicate publication IDs and unknown preview IDs are rejected", () => {
  const config = loadConfigs();
  config["publications.json"][1].id = config["publications.json"][0].id;
  const errors = validateConfigs(config).join("\n");
  assert.match(errors, /duplicate ID/);
  assert.match(errors, /pub-science: no publication/);
});
test("publications without custom previews are valid", () => {
  const config = loadConfigs();
  config["publication-previews.json"] = {};
  assert.deepEqual(validateConfigs(config), []);
});
test("missing assets and invalid chart values are rejected", () => {
  const config = loadConfigs();
  config["publication-previews.json"]["pub-cawn"].rows = [{ label: "Example", value: "2" }];
  const errors = validateConfigs(config, () => false).join("\n");
  assert.match(errors, /asset not found/);
  assert.match(errors, /rows\/0\/value/);
});
test("layout-specific fields and unknown keys are checked", () => {
  const config = loadConfigs();
  config["publication-previews.json"]["pub-cawn"].template = "budget";
  assert.match(validateConfigs(config).join("\n"), /ablationRows: required/);
  config["education.json"].enable = true;
  assert.match(validateConfigs(config).join("\n"), /additionalProperty.*enable/);
});

test("fixed templates support minimal basic, narrative and legacy layout configs", () => {
  const config = loadConfigs();
  const original = config["publication-previews.json"]["pub-cawn"];
  config["publication-previews.json"]["pub-cawn"] = { template: "basic", abstractExpanded: true };
  assert.deepEqual(validateConfigs(config), []);
  config["publication-previews.json"]["pub-cawn"] = {
    template: "narrative", takeaway: "A question", intro: "An introduction",
    headline: "Method", method: "Explanation", figure: original.figure,
    figureCaption: original.figureCaption, steps: [],
    blendFigureBackground: false, labels: { idea: "Research question" },
  };
  assert.deepEqual(validateConfigs(config), []);
  delete config["publication-previews.json"]["pub-cawn"].figure;
  assert.match(validateConfigs(config).join("\n"), /figure: required for narrative/);
  config["publication-previews.json"]["pub-cawn"] = { ...original, layout: original.template };
  delete config["publication-previews.json"]["pub-cawn"].template;
  assert.deepEqual(validateConfigs(config), []);
});
