export async function textLoader(path) { 
    if (!path) return "";

    let textData = "";
    fetch(path)
        .then(response => response.text())
        .then(data => {textData = data;})
        .catch(error => console.error("Error loading text:", error));

    return textData;
}

export async function jsonLoader(path) {
    if (!path) return null;

    let jsonData = null;
    await fetch(path)
        .then(response => response.json())
        .then(data => {jsonData = data;})
        .catch(error => console.error("Error loading JSON:", error));
        
    return jsonData;
}