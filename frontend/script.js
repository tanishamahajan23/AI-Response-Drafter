
const form = document.getElementById("inputForm");
const nameInput = document.getElementById("name");
const interestInput = document.getElementById("interest");
const messageInput = document.getElementById("message");
const fileInput = document.getElementById("file");
const loading = document.getElementById("loading");

const replyBox = document.getElementById("reply");
const scoreBox = document.getElementById("score");
const reasoningBox = document.getElementById("reasoning");

const resultsSection = document.getElementById("resultsSection");
const preview =
    document.querySelector("#previewTable");

const downloadBtn =
    document.getElementById("downloadBtn");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const csvData=[];

function wait(){
    document.getElementById("h4").hidden=true;
}
function showPreview(rows) {
    
    const tbody =
        document.querySelector("#previewTable tbody");

    tbody.innerHTML = "";

    rows.forEach(row => {

        tbody.innerHTML += `
            <tr>
                <td>${row.name}</td>
                <td>${row.interest}</td>
                <td>${row.message}</td>
            </tr>
        `;
    }
);
document.getElementById("previewTable").hidden = false;
}

function showResults(rows){

    const tbody =
        document.querySelector("#resultsTable tbody");

    tbody.innerHTML = "";

    rows.forEach(row => {

        tbody.innerHTML += `
            <tr>
                <td>${row.name}</td>
                <td>${row.interest}</td>
                <td>${row.message}</td>
                <td>${row.reply}</td>
                <td>${row.score}</td>
                <td>${row.reasoning}</td>
            </tr>
        `;
    }
);
document.getElementById("resultsSection").hidden = false;
wait();
}

fileInput.addEventListener("change", () => {

    document.getElementById("previewTable").hidden = true;
    const file = fileInput.files[0];

    if(!file) return;

    Papa.parse(file, {

        header:true,

        skipEmptyLines:true,

        complete: function(results){

            const uploadedRows = results.data.filter(row =>

                row.name?.trim() ||
                row.interest?.trim() ||
                row.message?.trim()

            );

            if(uploadedRows.length > 25){

                alert("Maximum 25 leads allowed.");
                fileInput.value="";
                return;
            }

            showPreview(uploadedRows);
        }

    });

});


form.addEventListener("submit", async (event) => {

event.preventDefault();
document.getElementById("resultsSection").hidden = true;
document.getElementById("h4").hidden=true;
document.getElementById("formOutput").hidden = true;


const formFilled =
        nameInput.value.trim() ||
        interestInput.value.trim() ||
        messageInput.value.trim();

    const file = document.getElementById("file").files[0];

try{
if (formFilled && file) {

        alert("Please either fill the form OR upload a CSV file.");

        return;
}


else if (!formFilled && !file) {
        alert("Please fill the form or upload a CSV file.");

        return;
}


else if(formFilled){
    

    loading.hidden = false;
    document.getElementById("formOutput").hidden = false;

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

else {
    document.getElementById("h4").hidden=false;

    loading.hidden = false;
    Papa.parse(file, {
    header: true,
    complete: async function(results) {

    const result = results.data;
    csvData.length = 0;
    for (const row of result) {

        if (
        !row.name?.trim() &&
        !row.interest?.trim() &&
        !row.message?.trim()
    ) {
        continue;
    }

    if (!row.message?.trim()) {

        csvData.push({
            ...row,
            reply: "Skipped",
            score: "N/A",
            reasoning: "No message provided."
        });

        continue;
    }

        const response = await fetch(
            "https://ai-response-drafter-backend.onrender.com/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(row)
            }
        );

        const text = await response.text();

        const data = JSON.parse(text);

        csvData.push({
            ...row,
            reply: data.reply,
            score: data.score,
            reasoning: data.reasoning
        });
    }

    csvData.sort((a, b) => b.score - a.score);
    console.log(csvData);
    showResults(csvData);
}
});
}
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

downloadBtn.addEventListener("click",()=>{

    const csv = Papa.unparse(csvData);

    const blob = new Blob(
        [csv],
        {type:"text/csv"}
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "responses.csv";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

;})