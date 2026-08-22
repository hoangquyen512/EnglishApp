const GREET = /^(hi|hello|hey|yo|good morning|good afternoon|good evening)\b/i;
const RAIN = /\b(rain|rains|rainy|raining|ranin|mưa|storm|cloudy)\b/i;
const HOT = /\b(hot|nắng|sunny|heat)\b/i;
const COLD = /\b(cold|lạnh|freezing)\b/i;
const TIRED = /\b(exhausted|tired|mệt)\b/i;
const CLEAN = /\b(clean|cleaning|house|chores|dọn)\b/i;
const WORK = /\b(work|job|office|deadline)\b/i;
const SAD = /\b(sad|lonely|heavy|depressed|buồn)\b/i;
const HAPPY = /\b(excited|happy|got the job|great|wonderful|vui|tuyệt)\b/i;
const OK = /\b(okay|ok|nothing much|fine|bình thường)\b/i;
const THANKS = /\b(thanks|thank you|cảm ơn)\b/i;
const BYE = /^(bye|goodbye|see you|good night)\b/i;

export function composeLocalReply(input: {
  text: string;
  lastCompanionReply?: string;
}): string {
  const options = repliesFor(input.text.trim());
  const unused = options.filter((line) => line !== input.lastCompanionReply);
  const pool = unused.length > 0 ? unused : options;
  const index = hash(input.text) % pool.length;
  return pool[index] ?? pool[0] ?? "I'm here. What's been on your mind?";
}

function repliesFor(text: string): string[] {
  if (BYE.test(text)) {
    return [
      "Take care. I'll be here whenever you want to talk.",
      "Rest well. Come back when you feel like chatting.",
    ];
  }
  if (GREET.test(text) || text.length < 8 && /^(hi|hello|hey)[!. ]*$/i.test(text)) {
    return [
      "Hey. How is your day going so far?",
      "Hi. What's been happening today?",
      "Hello. Anything sitting on your mind?",
    ];
  }
  if (THANKS.test(text)) {
    return [
      "Anytime. Want to keep talking?",
      "Glad it helped. What else is going on?",
    ];
  }
  if (RAIN.test(text) || /ranin/i.test(text)) {
    return [
      "A rainy day can feel slow. Are you staying in, or heading out anyway?",
      "Rain like that changes the whole mood. Cozy for you, or just annoying?",
    ];
  }
  if (HOT.test(text)) {
    return [
      "That heat wears you down. Did you get a cooler spot at least?",
      "Hot days drain people fast. How are you handling it?",
    ];
  }
  if (COLD.test(text)) {
    return [
      "Cold weather makes everything feel sharper. Are you keeping warm?",
      "A cold day like that. What's the plan — stay home or go out anyway?",
    ];
  }
  if (CLEAN.test(text)) {
    return [
      "A whole day cleaning the house would wipe me out too. Which part feels worst?",
      "Cleaning all day is real work. Did you get even a short break?",
    ];
  }
  if (TIRED.test(text)) {
    return [
      "Being that tired is a lot. What took most of your energy today?",
      "That kind of tired hits hard. Want to sit with it for a minute?",
    ];
  }
  if (SAD.test(text)) {
    return [
      "That sounds heavy. I'm here. What feels most stuck right now?",
      "I'm glad you said that. What would help a little tonight?",
    ];
  }
  if (WORK.test(text)) {
    return [
      "Work can eat a whole day. What was the hardest part?",
      "That job stretch sounds long. How are you holding up now?",
    ];
  }
  if (HAPPY.test(text)) {
    return [
      "That's really good to hear. What made it feel that way?",
      "I can feel the lift in that. Want to tell me more?",
    ];
  }
  if (OK.test(text)) {
    return [
      "A quiet day is still a day. Anything sitting on your mind anyway?",
      "Okay is okay. Want to talk about something small from today?",
    ];
  }
  return [
    "I'm with you. What about today is sitting heaviest?",
    "Got it. What happened around that?",
    "I'm listening. Where should we start with that?",
    "Okay. How did that land for you?",
  ];
}

function hash(text: string): number {
  let total = 0;
  for (const char of text) {
    total += char.charCodeAt(0);
  }
  return Math.abs(total);
}
