import { strict as assert } from "node:assert";
import {
  evolutionSubjects,
  getEvolutionSubject,
  getEvolutionSubjectTimeline,
} from "../data/speciesTimelines.js";

assert.deepEqual(
  evolutionSubjects.map((subject) => subject.id),
  ["life", "humans", "cats", "horses"],
);

for (const subject of evolutionSubjects) {
  assert.ok(subject.label.length > 0);
  assert.ok(subject.description.length > 0);
  assert.ok(subject.timeline.length >= 8);

  for (const event of subject.timeline) {
    assert.equal(typeof event.id, "string");
    assert.equal(typeof event.label, "string");
    assert.equal(typeof event.title, "string");
    assert.equal(typeof event.summary, "string");
    assert.equal(typeof event.millionYearsAgo, "number");
    assert.equal(typeof event.color, "string");
    assert.equal(typeof event.icon, "string");
  }

  for (let index = 1; index < subject.timeline.length; index += 1) {
    assert.ok(
      subject.timeline[index - 1].millionYearsAgo >=
        subject.timeline[index].millionYearsAgo,
      subject.id + " timeline must run from oldest to newest",
    );
  }
}

assert.equal(getEvolutionSubject("humans").id, "humans");
assert.equal(getEvolutionSubject("unknown").id, "life");
assert.equal(
  getEvolutionSubjectTimeline("cats"),
  getEvolutionSubject("cats").timeline,
);

console.log("PASS speciesTimelines");
