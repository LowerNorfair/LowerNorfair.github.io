/*
* global variables
*/
const TOC_ACTIVE_CLASS = "nav-active-item";
const TOC_EXPANDED_CLASS = "nav-expanded";
const ACTIVE_SECTION = "content-section-active";

let visibleSections = [];
let prevActiveSection;

/* 
* addNav sets up the nav list by finding any h2 and h3 elements
* then gives those headers an anchor named after the title's text
* and adds a list element linking to the header's anchor
*/
function addNav(){
    const navList = document.querySelector(".section-nav");
    const sections = document.querySelectorAll(".content-section");
    let sublist = null;

    if( sections.length <= 0 ) return;
    
    const fragment = document.createDocumentFragment();
    let parent = fragment;

    // add dataset for the top section
    document.querySelector("h1").dataset.nav = "toc-top";

    // loop through section headers
    sections.forEach((section) => {
        // only add nav for h2 and h3
        const sectionHeading = section.querySelector("h2, h3");
        if(!sectionHeading) return;

        // h3 segments should be added as a child of their parent's list
        if(sectionHeading.matches("h3") && parent == fragment){
                sublist = document.createElement("ul");
                fragment.appendChild(sublist);
                parent = sublist;
        }
        else if(sectionHeading.matches("h2")) parent = fragment;
        
        // add the new nav element to its parent
        addNavElement(sectionHeading, parent);
    });

    navList.appendChild(fragment);
}

/*
* addNavElement creates and adds a new list element to the nav
*/
function addNavElement(item, parent){
    // set section id anchor and data
    let title = item.textContent;
    let id = title.replace(/\W+/g, "-").toLowerCase().trim();
    item.id = id;
    item.dataset.nav = `toc-${id}`;
    
    // add new section header to navigation
    const ele = document.createElement('li');
    ele.id = item.dataset.nav;
    ele.innerHTML = `<a href=#${id}>${title}</a>`;
    parent.appendChild(ele);
}

/*
* toggle the active nav item
*/
function changeActiveNav(id){
    const active = document.getElementsByClassName(`${TOC_ACTIVE_CLASS}`)[0];
    if(active) active.classList.toggle(TOC_ACTIVE_CLASS);

    document.getElementById(id).classList.toggle(TOC_ACTIVE_CLASS);
}

/*
* section observer to keep track of what section is at the top of the screen
*/
function createObserver(){
    let observer;
    let options = {
        root: null,
        rootMargin: "-10% 0px 0px 0px", //10% margin for top section
        threshold: 0,
    };

    observer = new IntersectionObserver(handleIntersect, options);

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));
}

/*
* handleIntersect keeps track of visible sections and the active section
*/
function handleIntersect(entries, observer){
    // Add any sections comming into view, remove those going out
    entries.forEach((entry) => {
        if(entry.isIntersecting || entry.intersectionRatio > 0){
            // check for duplicates
            if(visibleSections.includes(entry.target)) return;

            visibleSections.push(entry.target);
        }
        else{
            let index = visibleSections.indexOf(entry.target);
            if(index != -1) visibleSections.splice(index, 1);
        }
    });

    // Exit if nothing is visible
    if(visibleSections.length <= 0) return;

    // sort to find the top section
    visibleSections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    const heading = visibleSections[0].querySelector("h1, h2, h3");

    // set the active heading
    if(!heading){
        changeActiveNav("toc-top");
    }
    else{
        changeActiveNav(heading.dataset.nav);
    }

    if(prevActiveSection)
        prevActiveSection.classList.toggle(ACTIVE_SECTION);
    visibleSections[0].classList.toggle(ACTIVE_SECTION);
    prevActiveSection = visibleSections[0];
}

/*
* adds smooth scroll to the nav links
*/
function sectionSmoothScroll(){
    document.querySelector("nav").addEventListener("click", function(e){
        if(e.target.matches("a")){
            e.preventDefault();
            const id = e.target.href.split("#").pop();
            if(!id)
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth",
                  });
            else
                document.getElementById(id).scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest"
                });
        }
    });

}

/*
* navExpand handles the nav when using a smaller screen
*/
function navExpand(){
    const navButton = document.querySelector(".expand-nav-btn");
    const nav = document.querySelector(".section-nav");
    navButton.addEventListener("click", (e) => {
        e.preventDefault();
        nav.classList.toggle(TOC_EXPANDED_CLASS);
    });
}

/*
* initalise the page
*/
function Initalise(){
    // Create the navigation
    addNav();
    // Create the section observer
    window.addEventListener("load", createObserver, false);
    // Set up smooth scrolling for the nav
    sectionSmoothScroll();
    // Set up nav expansion for small screens
    navExpand();
}

Initalise();