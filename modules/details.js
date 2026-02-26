import {cssToJss} from 'https://cdn.jsdelivr.net/gh/MasterClassOnRightTrack/ZHtmlText_Into_Html@main/ZHtmlText_Into_Html/CSS_Into_JSS.js';

let jssStyles;
let positionStyles;
let animationStyles;

let resizeList = {};
let xDetailCounter = 0;
let dotDetailCounter = 0;
let textSectionCounter = 0;


async function loadJssStyles() {
    const res = await fetch('../styles/details.css');
    const data = await res.text();
    return cssToJss(data.replace(/\/\*[\s\S]*?\*\//g, "")); // Remove comments before converting to JSS
}

async function loadPositionStyles() {
    const res = await fetch('../styles/positions.css');
    const data = await res.text();
    return cssToJss(data.replace(/\/\*[\s\S]*?\*\//g, "")); // Remove comments before converting to JSS
}

async function loadAnimationStyles() {
    const res = await fetch('../styles/animation.css');
    const data = await res.text();
    return cssToJss(data.replace(/\/\*[\s\S]*?\*\//g, "")); // Remove comments before converting to JSS
}

function convertComplexToPx(formula, type) {
    const vh = window.innerHeight / 100;
    const vw = window.innerWidth / 100;

    return formula
        .replace(/(\d*\.?\d+)vh/g, (match, num) => parseFloat(num) * vh)
        .replace(/(\d*\.?\d+)vw/g, (match, num) => parseFloat(num) * vw)
        .replace(/(\d*\.?\d+)%/g, (match, num) => parseFloat(num) * (type == "width" ? vw : vh)); // Assuming percentage is based on viewport width or height

    // example: "100vh * 326 - 23 + 10%"
    // result: "1080 * 326 - 23 + 192"
}

console.log(convertComplexToPx("100vh * 326 - 23 + 10%"));

function resizeElementsBasedOnViewport() {

    for (const [key, value] of Object.entries(resizeList)) {
        if (key && value) {
            console.log(key, value);

            const element = document.getElementById(key);
    
            if (value.w || value.w != undefined)  
                {
                    const val = convertComplexToPx(value.w, "width");
                    element.style.width = val + "px"
                    element.style.maxWidth = val + "px"

                    console.log(val)
                };
            if (value.h || value.h != undefined)  
                {
                    const val = convertComplexToPx(value.h, "height");
                    element.style.height = val + "px"
                    element.style.maxHeight = val + "px"

                    console.log(val)

                };
        }
    }

    let vh = window.innerHeight;
    let vw = window.innerWidth;

    document.querySelectorAll(".xDetail").forEach(element => {
        
        if (vh > vw || vh < (vw / 3)) {
            element.style.display = "none";
        }else {
            element.style.display = "block";
        }
    });

    
    document.querySelectorAll(".dotDetail").forEach(element => {
        
        if (vh > vw || vh < (vw / 3)) {
            element.style.display = "none";
        }else {
            element.style.display = "block";
        }
    });
}

function updateSizeBasedOnViewport(n) {
    
    window.addEventListener('resize', () => { 
        resizeElementsBasedOnViewport();
    });
}

export function smartUI(object, data) {
    class smartUIElement {
        constructor(element, data) {
            this.element = element;
            this.position = (!data || data.position === null || data.position == undefined) ? "_globalTopRight" : data.position;
            this.shouldAnimate = (data && data.animationOptions && data.animationOptions[0]) ? true : false;
            this.shouldSwipe = (data && data.animationOptions && data.animationOptions[1]) ? true : false;
            this.swipeDirection = (data && data.animationOptions && data.animationOptions[2]) ? data.animationOptions[2] : "right";
        };

        unload() {
            if (!this.shouldAnimate) {
                this.element.classList.add("positionTransition");
            }else {
                this.element.classList.remove("powerOnAnimation");
                this.element.classList.remove("swipeTransition");
            }

            this.element.classList.add("reverseSwipeTransition");
            this.element.classList.add("powerOffAnimation");

            setTimeout(() => { 
                if (this.element && this.element.classList.contains(this.position)) {
                    this.element.classList.remove(this.position);
                }               
            },1500);
        };

    }

    return new smartUIElement(object, data);
}

updateSizeBasedOnViewport();

 // main component for xDetail are (number of x's, position, [shouldAnimate, shouldSwipe, swipeDirection])
export async function xDetail(n, position, animationOptions) {

    if (jssStyles == null) {
        jssStyles = await loadJssStyles();
    }

    if (positionStyles == null) {
        positionStyles = await loadPositionStyles();
    }

    if (animationStyles == null) {
        animationStyles = await loadAnimationStyles();
    }
    Number(n); // Ensure n is treated as a number

    n = (!n || isNaN(n)|| n == undefined) ? 6 : n; // Default to 6 if n is not provided or is not a number
    position = (position === null || position === undefined) ? "_globalTopRight" : position;

    xDetailCounter += 1;

    let defaultText = "x";

    const _xDetail = document.createElement("div");
    _xDetail.id = `xDetail_${xDetailCounter}`;

    Object.assign(_xDetail.style, jssStyles.xDetail);


    if (animationOptions && animationOptions[0]) { // shouldAnimate
        Object.assign(_xDetail.style, animationStyles.positionTransition);

        _xDetail.classList.add("powerOnAnimation");
        _xDetail.classList.add("positionTransition");

        if (animationOptions[1]) { // shouldSwipe
            animationOptions[2] = (animationOptions[2] == null || animationOptions[2] == undefined) ? "right" : animationOptions[2]; // Default to "right" if swipeDirection is not provided
            _xDetail.style[animationOptions[2]] = "-1000px";
            Object.assign(_xDetail.style, animationStyles.swipeTransition);
            _xDetail.classList.add("swipeTransition");
        }
    }


    // Calculate the width of the text based on the number of characters and font size
    const defaultHorizontalCount = 3; // The default number of characters (e.g., "xxx")
    const fontSize = 5; // u vh
    const spacing = 0.5; // u vh
    const factor = 0.52; // prosečna širina za Arial 'x'

    // resizeList[_xDetail.id] = {
    //     w: `(${3} * (${fontSize}vh * ${factor}) + (${3} * ${spacing}vh))`,
    // };

    _xDetail.style.width = `calc(${defaultHorizontalCount} * (${fontSize}vh * ${factor}) + (${defaultHorizontalCount} * ${spacing}vh) + 1.5vh)`;

    console.log(defaultText.repeat(n));
    _xDetail.textContent = defaultText.repeat(n);
    _xDetail.classList.add("xDetail");

    document.body.appendChild(_xDetail);

    let delay = animationOptions[1] ? 1000 : 0; // If shouldSwipe is true, add a delay to allow the initial position to be set before transitioning

    setTimeout(() => {
        Object.assign(_xDetail.style, positionStyles[position]);
        _xDetail.classList.add(position);
    }, delay);

    resizeElementsBasedOnViewport();

    return smartUI(_xDetail, {position, animationOptions});
}

 // main component for dotDetail are (number of x's, position, [shouldAnimate, shouldSwipe, swipeDirection])
export async function dotDetail(n, position, animationOptions) {
    
    if (jssStyles == null) {
        jssStyles = await loadJssStyles();
    }

    if (positionStyles == null) {
        positionStyles = await loadPositionStyles();
    }

    if (animationStyles == null) {
        animationStyles = await loadAnimationStyles();
    }

    Number(n); // Ensure n is treated as a number

    n = (!n || isNaN(n)|| n == undefined) ? 3 : n; // Default to 6 if n is not provided or is not a number
    position = (position === null || position === undefined) ? "_globalBottomRight" : position;

    dotDetailCounter += 1;

    const _dotDetail = document.createElement("div");
    _dotDetail.id = `dotDetail_${dotDetailCounter}`;

    Object.assign(_dotDetail.style, jssStyles.dotDetail_container);

    let dotList = []

    for (let i = 0; i < n; i++) {
        const dot = document.createElement("div");
        dot.className = "dotDetail";
        dot.style.gridColumn = i + 1; // Position the dot in the correct column
        _dotDetail.appendChild(dot);

        dotList.push(dot);
    }

    if (animationOptions && animationOptions[0]) { // shouldAnimate
        Object.assign(_dotDetail.style, animationStyles.positionTransition);

        _dotDetail.classList.add("positionTransition");

        dotList.forEach(dot => {
            dot.classList.add("powerOnAnimation");
        });

        if (animationOptions[1]) { // shouldSwipe
            animationOptions[2] = (animationOptions[2] == null || animationOptions[2] == undefined) ? "right" : animationOptions[2]; // Default to "right" if swipeDirection is not provided
            _dotDetail.style[animationOptions[2]] = "-1000px";
            Object.assign(_dotDetail.style, animationStyles.swipeTransition);
            _dotDetail.classList.add("swipeTransition");
        }
    }

    // resizeList[_xDetail.id] = {
    //     w: `(${3} * (${fontSize}vh * ${factor}) + (${3} * ${spacing}vh))`,
    // };

    _dotDetail.classList.add("dotDetail_container");
    _dotDetail.style.width = `calc(${n} * (1vh) + (${n - 1} * 10px) + 10px)`;

    _dotDetail.style.maxWidth = `calc(${n} * (1vh + 10px) + (${n - 1} * 10px) + 10px)`;

    document.body.appendChild(_dotDetail);

    let delay = animationOptions[1] ? 1000 : 0; // If shouldSwipe is true, add a delay to allow the initial position to be set before transitioning

    setTimeout(() => {
        Object.assign(_dotDetail.style, positionStyles[position]);
        _dotDetail.classList.add(position);
    }, delay);

    resizeElementsBasedOnViewport();

    return smartUI(_dotDetail, {position, animationOptions});
}

 // main component for textSection are (position, [shouldAnimate, shouldSwipe, swipeDirection], {title = "title", description = "description"})
export async function textSection(position, animationOptions, textSource) {
    
    if (jssStyles == null) {
        jssStyles = await loadJssStyles();
    }

    if (positionStyles == null) {
        positionStyles = await loadPositionStyles();
    }

    if (animationStyles == null) {
        animationStyles = await loadAnimationStyles();
    }

    position = (position === null || position === undefined) ? "_globalCenterLeft" : position;
    let titleSource = (textSource && textSource.title) ? textSource.title : "Title";
    let descriptionSource = (textSource && textSource.description) ? textSource.description : "Description";

    textSectionCounter += 1;

    const _textSection = document.createElement("div");
    _textSection.id = `textSection_${textSectionCounter}`;
    _textSection.className = "textContainer";


    const _textTitle = document.createElement("h1");
    _textTitle.className = "textTitle";
    _textTitle.textContent = titleSource;
    _textSection.appendChild(_textTitle);

    const _textDescription = document.createElement("p");
    _textDescription.className = "textDescription";
    _textDescription.textContent = descriptionSource;
    _textSection.appendChild(_textDescription);

    Object.assign(_textSection.style, jssStyles.textSection_container);

    if (animationOptions && animationOptions[0]) { // shouldAnimate
        Object.assign(_textSection.style, animationStyles.positionTransition);

        _textSection.classList.add("positionTransition");

        _textTitle.classList.add("powerOnAnimation");
        _textDescription.classList.add("powerOnAnimation");

        if (animationOptions[1]) { // shouldSwipe
            animationOptions[2] = (animationOptions[2] == null || animationOptions[2] == undefined) ? "left" : animationOptions[2]; // Default to "right" if swipeDirection is not provided
            _textSection.style[animationOptions[2]] = "-1000px";
            Object.assign(_textSection.style, animationStyles.swipeTransition);
            _textSection.classList.add("swipeTransition");
        }
    }

    // resizeList[_xDetail.id] = {
    //     w: `(${3} * (${fontSize}vh * ${factor}) + (${3} * ${spacing}vh))`,
    // };

    document.body.appendChild(_textSection);

    let delay = animationOptions[1] ? 1000 : 0; // If shouldSwipe is true, add a delay to allow the initial position to be set before transitioning

    setTimeout(() => {
        Object.assign(_textSection.style, positionStyles[position]);
        _textSection.classList.add(position);
    }, delay);

    resizeElementsBasedOnViewport();

    return smartUI(_textSection, {position, animationOptions});
}