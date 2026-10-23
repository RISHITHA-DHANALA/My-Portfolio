// The Missing Case — a small, self-contained mystery generator.
// Every call builds a brand-new case: new names, a new missing item, and a
// fresh set of three plain-language clues. Exactly one of the four suspects
// matches all three clues, so every case is solvable by simply reading.

const NAMES = [
  "Aarav", "Bhavna", "Chetan", "Divya", "Farah", "Gopal", "Hema", "Ishan",
  "Jaya", "Kiran", "Lata", "Meera", "Nikhil", "Pranav", "Rekha", "Sameer",
];
const ITEMS = ["case file", "blue folder", "final report", "project draft", "research notebook", "attendance register"];
const PLACES = ["the office", "the records room", "the library", "the classroom", "the lab"];

// Each trait: how the clue reads at the scene, how it reads on a suspect
// card, and the possible values it can take.
const TRAITS = [
  {
    clue: (v) => `Near the empty spot, someone had dropped ${v}.`,
    line: (v) => `Carried ${v}.`,
    values: ["a blue pen", "a red scarf", "a black umbrella", "a yellow notepad"],
  },
  {
    clue: (v) => `The visitor log was signed by someone from the ${v} team.`,
    line: (v) => `Works with the ${v} team.`,
    values: ["accounts", "design", "support", "library"],
  },
  {
    clue: (v) => `A witness saw someone near the spot around ${v}.`,
    line: (v) => `Was there around ${v}.`,
    values: ["4:40 pm", "5:10 pm", "5:40 pm", "6:15 pm"],
  },
  {
    clue: (v) => `The door camera caught someone wearing ${v}.`,
    line: (v) => `Was wearing ${v}.`,
    values: ["a green hoodie", "a grey blazer", "a white kurta", "a denim jacket"],
  },
  {
    clue: (v) => `A half-finished cup of ${v} was left by the door.`,
    line: (v) => `Was drinking ${v}.`,
    values: ["black coffee", "masala chai", "green tea", "cold water"],
  },
  {
    clue: (v) => `Someone had been sitting ${v} all afternoon.`,
    line: (v) => `Was sitting ${v}.`,
    values: ["by the window", "near the printer", "next to the plant", "facing the door"],
  },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function makeCase() {
  const suspects = shuffle(NAMES).slice(0, 4).map((name) => ({ id: name, name, lines: [] }));
  const traits = shuffle(TRAITS).slice(0, 3);
  const culpritIndex = Math.floor(Math.random() * suspects.length);
  const clues = [];

  traits.forEach((trait, traitIndex) => {
    const culpritValue = pick(trait.values);
    clues.push(trait.clue(culpritValue));
    suspects.forEach((suspect, i) => {
      if (i === culpritIndex) {
        suspect.lines.push(trait.line(culpritValue));
        return;
      }
      // Every innocent clearly misses at least one clue, so the answer is
      // always unique: innocent i never matches trait (i % traits.length).
      const missesThisTrait = traitIndex === i % traits.length;
      const value = missesThisTrait
        ? pick(trait.values.filter((v) => v !== culpritValue))
        : pick(trait.values);
      suspect.lines.push(trait.line(value));
    });
  });

  const culprit = suspects[culpritIndex];
  return {
    story: `A ${pick(ITEMS)} went missing from ${pick(PLACES)} on a quiet afternoon. Four people were around at the time.`,
    clues,
    suspects,
    culpritId: culprit.id,
    explanation: `${culprit.name} is the only person who matches all three clues. ${culprit.lines.join(" ")}`,
  };
}