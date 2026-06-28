const form = document.getElementById("inputForm");
const nameInput = document.getElementById("name");
const interestInput = document.getElementById("interest");
const messageInput = document.getElementById("message");

const loading = document.getElementById("loading");

const replyBox = document.getElementById("reply");
const scoreBox = document.getElementById("score");
const reasoningBox = document.getElementById("reasoning");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");


form.addEventListener("submit", async (event) => {

    
    event.preventDefault();

    loading.hidden = false;

    try {
        const formData = {
             name: nameInput.value,
            interest: interestInput.value,
             message: messageInput.value
         };

    const response = await fetch("https://ai-response-drafter-backend.onrender.com/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    const text = await response.text();
    

    const data = JSON.parse(text);

        replyBox.value = data.reply;
        scoreBox.textContent = `${data.score}/10`;
        reasoningBox.textContent = data.reasoning;

}
catch (error) {

        console.error(error);

        replyBox.value = "Something went wrong.";
        scoreBox.textContent = "--/10";
        reasoningBox.textContent =
            "Could not generate response.";

    } 
    finally {

        
        loading.hidden = true;
    }
});



copyBtn.addEventListener("click", async () => {

    if (!replyBox.value.trim()) return;

    try {

        await navigator.clipboard.writeText(replyBox.value);

        copyBtn.textContent = "Copied!";

        setTimeout(() => {
            copyBtn.textContent = "Copy Reply";
        }, 2000);

    } catch (error) {
        console.log(error);
    }
});


clearBtn.addEventListener("click", () => {

    form.reset();

    replyBox.value = "";
    scoreBox.textContent = "--/10";
    reasoningBox.textContent =
        "Query Analysis will appear here.";
});