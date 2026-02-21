const chipImage = document.getElementById("chip_Image");

window.addEventListener("resize", () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the new size for the chip image based on the smaller dimension of the window
    const newSize = Math.min(windowWidth, windowHeight) * 0.2; // Adjust the multiplier as needed

    // Set the new size for the chip image
    chipImage.style.width = `${newSize}px`;
    chipImage.style.height = `${newSize}px`;
});
