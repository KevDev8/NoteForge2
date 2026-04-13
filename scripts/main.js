// Responsive Menu
const menu_icon = document.querySelector("#mobile-menu-icon");
const menu = document.querySelector("#mobile-menu-nav");
        
menu_icon.addEventListener("click", () => {
    menu_icon.classList.toggle("fa-bars");
    menu_icon.classList.toggle("fa-times");
    
    menu.classList.toggle("hide-menu");
});

// Temporary text while plans load
const loading = document.createElement("p");
loading.textContent = "Loading plans...";

const plans_container = document.querySelector("#pricing-plans");
plans_container.appendChild(loading);

// Fetch Plans
let data;
async function getplans() {
    try {
        const response = await fetch("/api");
        data = await response.json();
    } catch (error) { console.log("Error: ", error); }

    plans_container.removeChild(loading);
    
    for (const plan of data) {
        const card = document.createElement("div");
        card.classList.add("plan", "flex-card");
        
        if (plan.commercial_use) card.classList.add("commercial");

        const isCustom = plan.name === "Custom";

        const price = isCustom ? (plan.price ?? "Request") : (plan.price ? `$${plan.price}/month` : "Free");
        const commercialUse = isCustom ? "Request" : (plan.commercial_use ? "Yes" : "No");
        const userLimit = isCustom ? (plan.user_limit ?? "Request") : (plan.user_limit ?? "Unlimited");
        const projectLimit = isCustom ? (plan.project_limit ?? "Request") : (plan.project_limit ?? "Unlimited");

        const ul = document.createElement("ul");

        for (const feature of plan.features) {
            const li = document.createElement("li");
            li.textContent = feature;
            ul.appendChild(li);
        }

        const infoFeatures = [
            `Commercial use: ${commercialUse}`,
            `Users: ${userLimit}`,
            `Projects: ${projectLimit}`
        ];

        for (const info of infoFeatures) {
            const li = document.createElement("li");
            li.textContent = info;
            ul.appendChild(li);
        }

        card.innerHTML = `
            <div class="plan-title">
                <h2><strong>${plan.name}</strong></h2>
                <h4><strong>${price}</strong></h4>
            </div>

            <div class="plan-description">
                <p class="plan-summary">
                    ${plan.summary ?? ""}
                </p>

                <div class="plan-features"></div>

                <button>
                    ${isCustom ? "Contact sales" : "Get this plan"}
                </button>
            </div>
        `;

        card.querySelector(".plan-features").appendChild(ul);
        plans_container.appendChild(card);
    }
}
getplans();
