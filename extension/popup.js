document.getElementById("scrapeBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPerformers
    }, (result) => {
        if (result && result[0] && result[0].result) {
            document.getElementById("result").value = result[0].result.join("\n");
        } else {
            document.getElementById("result").value = "No performers found!";
        }
    });
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    let text = document.getElementById("result").value;
    if (!text) return alert("No data to download!");

    let csvContent = "data:text/csv;charset=utf-8," + "Name\n" + text.replace(/\n/g, "\n");
    let encodedUri = encodeURI(csvContent);
    
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "babepedia_favorites.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
