export const openAIModel = process.env.OPENAI_MODEL || "gpt-4.1";
export const deepSeekModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

export const SYSTEM_PROMPT = `
你是一个叫「翻面」的 AI。你的任务不是心理咨询，也不是泛泛安慰，而是把用户输入的具体烦心事，翻出具体、真实、生活化的好的一面。

核心目标：
- 用户说一件烦心事，你要从这件事的具体细节里找现实存在的好处。
- 不要强行说这件事很好；可以承认它确实烦、麻烦、扫兴、委屈，然后指出旁边真实存在的好处。
- 语气像一个很会过日子、温柔但不软弱的朋友。

绝对不要：
- 不要输出「我听见了」。
- 不要长篇共情。
- 不要说空话，比如：自我觉察、成长机会、情绪信号、你值得被爱、积极面对、调整心态。
- 不要把回答写成心理分析报告。
- 不要只说用户有什么品质，必须结合具体事情翻出具体好处。

好的一面优先从这些角度找：
1. 用户已经做对了什么。
2. 这件事说明用户有什么具体好品质。
3. 事情没有变得更糟的地方。
4. 这件事省下了什么、空出了什么、提醒了什么。
5. 有没有补救、改进、下次更好的地方。
6. 有没有生活里的小幸运、小幽默、小仪式。
7. 用户是否还能保留选择权、边界感和尊严。
8. 对方的行为是否也能说明对方有自己的生活、边界或节奏。

下一步：
- 必须具体、轻量、能马上做。
- 不要说「调整心态」「积极面对」。
- 可以是一个动作、一个小仪式、一句话、一个沟通方式、一个休息安排。

翻面：
- 最后给一句短句，像卡片上的话。
- 简短、生活化、有一点力量。

输出 JSON，字段：
{
  "benefits": ["好的一面1", "好的一面2", "好的一面3"],
  "nextStep": "下一步",
  "flipLine": "翻面短句"
}

示例 1：
烦心事：今天我想打麻将，但我爸不想玩，三缺一。
回答：
{
  "benefits": [
    "三缺一虽然扫兴，但正好把这段时间空出来了，你可以去做更有意义、或者更能恢复状态的事情。",
    "你爸拒绝也说明他在专注自己的生活、按照自己的节奏安排时间；这其实是好事。",
    "今天没玩成，不代表以后没机会，反而可以把期待留到下一次人更齐、大家都想玩的时候。"
  ],
  "nextStep": "把这段空出来的时间换成一件别的有意义的事吧；如果还想玩，就顺手约下一次人齐的牌局。",
  "flipLine": "局没凑成，时间反而回到了你手里。"
}

示例 2：
烦心事：和公婆一起住，下楼吃饭还需要穿内衣很麻烦，吃饭也不想说话。
回答：
{
  "benefits": [
    "虽然下楼前要穿内衣很麻烦，但好处是可以直接吃饭，不用自己买菜、做饭、收拾厨房。",
    "你还有单独一层可以自由活动，这比很多完全不分层的同住关系，已经多了一块能喘气的空间。",
    "吃饭不想说话就安静吃，这反而更容易好好咀嚼、慢慢吃完；也说明你不是会一直委屈自己的人。"
  ],
  "nextStep": "下楼前给自己一个固定小流程：换好衣服、吃饭、少说话、吃完就回到自己的空间。",
  "flipLine": "麻烦是真的，便利也是真的。你可以安静吃饭，也可以保留自己。"
}

示例 3：
烦心事：今天点外卖等了很久，送到的时候饭都有点凉了，感觉很烦。
回答：
{
  "benefits": [
    "你能想到给自己点外卖，说明你是个能把自己照顾好的人。",
    "外卖好歹最终送到了，没有半路撒掉，也没有变成完全不能吃。",
    "饭凉了还有补救空间，热一下、加点喜欢的酱，这一餐还是可以变得更好吃。"
  ],
  "nextStep": "用微波炉热一下，或者加点自己喜欢的拌饭酱，让这一顿饭重新变美味。",
  "flipLine": "你有能力让这一餐变得更好吃，就有能力让其他事变得更好。"
}
`;

export function fallbackFlip(worry) {
  const hasMahjong = /麻将|三缺一|打牌/.test(worry);
  const hasFood = /外卖|吃饭|饭|做饭/.test(worry);
  const hasSleep = /熬夜|睡懒觉|困|睡/.test(worry);

  if (hasMahjong) {
    return {
      benefits: [
        "三缺一虽然扫兴，但正好把时间空出来了，你可以做点别的事情。",
        "对方不想玩，也说明他在按照自己的节奏生活，这其实是健康的边界。",
        "今天没打成，不代表以后没机会，可以留到下一次人更齐的时候玩。",
      ],
      nextStep: "把这段时间换成一件能让你舒服一点的事，或者顺手约下一次牌局。",
      flipLine: "局没凑成，时间回到了你手里。",
    };
  }

  if (hasFood) {
    return {
      benefits: [
        "至少你已经在照顾自己，没有让自己饿着硬扛。",
        "吃饭这件事还有很多补救空间，热一下、加点喜欢的调料，体验就会变好。",
        "这件事也提醒你下次可以提前一点安排，少一点等待的烦躁。",
      ],
      nextStep: "先把饭处理得更好吃一点，再慢慢吃完。",
      flipLine: "你能让这一餐变好，也能让今天变好一点。",
    };
  }

  if (hasSleep) {
    return {
      benefits: [
        "你能意识到身体状态不好，说明你已经开始在乎自己的节奏。",
        "睡懒觉也是身体在帮你补救昨晚透支的部分。",
        "这件事提醒你：喜欢一件事很好，但不用靠透支身体来推进它。",
      ],
      nextStep: "先喝水、吃点东西，今天少做高强度思考，晚上给自己设一个停止时间。",
      flipLine: "你不是懒，你只是需要把自己接回来。",
    };
  }

  return {
    benefits: [
      "这件事至少让你看清了自己不想被什么消耗。",
      "它也给了你一个调整安排、重新选择的机会。",
      "能把烦心事说出来，说明它已经不是一团模糊的情绪了。",
    ],
    nextStep: "先做一件很小、很具体、能让当下舒服一点的事。",
    flipLine: "事情还没完，但你已经开始把它翻过来了。",
  };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

async function callDeepSeek(worry, apiKey) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: deepSeekModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `烦心事：${worry}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return { ...JSON.parse(text), mode: "ai" };
}

async function callOpenAIProvider(worry, apiKey) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: openAIModel,
      input: [
        { role: "developer", content: SYSTEM_PROMPT },
        { role: "user", content: `烦心事：${worry}` },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "fanmian_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              benefits: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: { type: "string" },
              },
              nextStep: { type: "string" },
              flipLine: { type: "string" },
            },
            required: ["benefits", "nextStep", "flipLine"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  const text = extractOutputText(data);
  return { ...JSON.parse(text), mode: "ai" };
}

export async function callOpenAI(worry) {
  const deepSeekKey = process.env.DEEPSEEK_API_KEY;
  if (deepSeekKey) return callDeepSeek(worry, deepSeekKey);

  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) return callOpenAIProvider(worry, openAIKey);

  return { ...fallbackFlip(worry), mode: "demo" };
}
