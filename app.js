const worryInput = document.querySelector("#worryInput");
const flipButton = document.querySelector("#flipButton");
const buttonText = document.querySelector("#buttonText");
const spinner = document.querySelector("#spinner");
const counter = document.querySelector("#counter");
const modeLabel = document.querySelector("#modeLabel");
const inputPanel = document.querySelector("#inputPanel");
const resultPanel = document.querySelector("#resultPanel");
const benefitsList = document.querySelector("#benefitsList");
const nextStepText = document.querySelector("#nextStepText");
const flipLineText = document.querySelector("#flipLineText");
const newButton = document.querySelector("#newButton");
const feedbackNote = document.querySelector("#feedbackNote");
const saveFeedbackButton = document.querySelector("#saveFeedbackButton");
const historyButton = document.querySelector("#historyButton");
const historyDialog = document.querySelector("#historyDialog");
const closeHistoryButton = document.querySelector("#closeHistoryButton");
const historyList = document.querySelector("#historyList");
const copyFeedbackButton = document.querySelector("#copyFeedbackButton");

const storageKey = "fanmian.records.v1";
let currentRecord = null;

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function setRecords(records) {
  localStorage.setItem(storageKey, JSON.stringify(records.slice(0, 80)));
}

function saveRecord(record) {
  const records = getRecords();
  setRecords([record, ...records.filter((item) => item.id !== record.id)]);
}

function setLoading(isLoading) {
  flipButton.disabled = isLoading;
  flipButton.classList.toggle("loading", isLoading);
  spinner.hidden = !isLoading;
  buttonText.textContent = isLoading ? "正在翻面" : "翻面";
}

function renderResult(result, worry) {
  benefitsList.innerHTML = "";
  result.benefits.forEach((benefit) => {
    const li = document.createElement("li");
    li.textContent = benefit;
    benefitsList.appendChild(li);
  });
  nextStepText.textContent = result.nextStep;
  flipLineText.textContent = result.flipLine;
  modeLabel.textContent = result.mode === "demo" ? "演示翻面" : "AI 翻面";

  currentRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    worry,
    response: result,
    rating: "",
    note: "",
  };
  saveRecord(currentRecord);

  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function flipWorry() {
  const worry = worryInput.value.trim();
  if (!worry) {
    worryInput.focus();
    return;
  }

  setLoading(true);
  feedbackNote.value = "";
  feedbackNote.classList.add("hidden");
  saveFeedbackButton.classList.add("hidden");

  try {
    const response = await fetch("/api/flip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ worry }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "翻面失败");
    renderResult(data, worry);
  } catch (error) {
    renderResult(
      {
        mode: "demo",
        benefits: [
          "这次请求没有成功，但这也帮我们发现：试用版需要更稳定的网络和模型配置。",
          "你的烦心事已经被保留下来了，等服务恢复后可以再试一次。",
        ],
        nextStep: error.message,
        flipLine: "产品也会翻车，修好它就是下一面。",
      },
      worry
    );
  } finally {
    setLoading(false);
  }
}

function resetInput() {
  resultPanel.classList.add("hidden");
  worryInput.value = "";
  counter.textContent = "0/800";
  inputPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  setTimeout(() => worryInput.focus(), 220);
}

function renderHistory() {
  const records = getRecords();
  historyList.innerHTML = "";
  if (!records.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有试用记录。";
    historyList.appendChild(empty);
    return;
  }

  records.forEach((record) => {
    const item = document.createElement("article");
    item.className = "history-item";
    const title = document.createElement("strong");
    title.textContent = record.rating ? `反馈：${record.rating === "good" ? "像" : "不像"}` : "未反馈";
    const worry = document.createElement("p");
    worry.textContent = `烦心事：${record.worry}`;
    const flip = document.createElement("p");
    flip.textContent = `翻面：${record.response.flipLine}`;
    const note = document.createElement("p");
    note.textContent = record.note ? `意见：${record.note}` : "";
    item.append(title, worry, flip);
    if (record.note) item.append(note);
    historyList.appendChild(item);
  });
}

function exportFeedback() {
  const text = getRecords()
    .map((record, index) => {
      const benefits = record.response.benefits.map((item, i) => `${i + 1}. ${item}`).join("\n");
      return [
        `${index + 1}.`,
        `烦心事：${record.worry}`,
        "好的一面：",
        benefits,
        `下一步：${record.response.nextStep}`,
        `翻面：${record.response.flipLine}`,
        `反馈：${record.rating || "未反馈"}`,
        record.note ? `意见：${record.note}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const output = text || "暂无反馈记录";
  const done = () => {
    copyFeedbackButton.textContent = "已复制";
    setTimeout(() => {
      copyFeedbackButton.textContent = "复制反馈给开发者";
    }, 1200);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(output).then(done).catch(() => {
      window.prompt("复制失败时，可以长按复制下面的反馈：", output);
    });
    return;
  }

  window.prompt("可以长按复制下面的反馈：", output);
}

worryInput.addEventListener("input", () => {
  counter.textContent = `${worryInput.value.length}/800`;
});

flipButton.addEventListener("click", flipWorry);
newButton.addEventListener("click", resetInput);
historyButton.addEventListener("click", () => {
  renderHistory();
  historyDialog.showModal();
});
closeHistoryButton.addEventListener("click", () => historyDialog.close());
copyFeedbackButton.addEventListener("click", exportFeedback);

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    worryInput.value = button.dataset.sample;
    counter.textContent = `${worryInput.value.length}/800`;
  });
});

document.querySelectorAll("[data-rating]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!currentRecord) return;
    currentRecord.rating = button.dataset.rating;
    feedbackNote.classList.toggle("hidden", currentRecord.rating !== "bad");
    saveFeedbackButton.classList.toggle("hidden", currentRecord.rating !== "bad");
    saveRecord(currentRecord);
  });
});

saveFeedbackButton.addEventListener("click", () => {
  if (!currentRecord) return;
  currentRecord.note = feedbackNote.value.trim();
  saveRecord(currentRecord);
  saveFeedbackButton.textContent = "已保存";
  setTimeout(() => {
    saveFeedbackButton.textContent = "保存反馈";
  }, 1200);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
