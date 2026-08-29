// ========================================
// JAWPE WEBSITE JAVASCRIPT
// ========================================


// COPY CONTRACT ADDRESS

function copyContract() {

    const contract =
        document.getElementById("contract").innerText;


    if (contract === "COMING SOON") {

        alert(
            "Contract address belum tersedia."
        );

        return;
    }


    navigator.clipboard
        .writeText(contract)
        .then(() => {

            alert(
                "Contract address berhasil dicopy!"
            );

        })
        .catch(() => {

            alert(
                "Gagal menyalin contract address."
            );

        });

}



// ========================================
// NAVBAR SCROLL EFFECT
// ========================================

window.addEventListener(
    "scroll",
    function () {

        const navbar =
            document.querySelector(".navbar");


        if (window.scrollY > 50) {

            navbar.style.background =
                "rgba(5,5,5,0.95)";

        } else {

            navbar.style.background =
                "rgba(5,5,5,0.85)";

        }

    }
);



// ========================================
// SIMPLE REVEAL ANIMATION
// ========================================

const sections =
    document.querySelectorAll(
        ".section, .community"
    );


const observer =
    new IntersectionObserver(
        function (entries) {

            entries.forEach(
                function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.style.opacity = "1";

                        entry.target.style.transform =
                            "translateY(0)";

                    }

                }
            );

        },
        {
            threshold: 0.1
        }
    );


sections.forEach(
    function (section) {

        section.style.opacity = "0";

        section.style.transform =
            "translateY(30px)";

        section.style.transition =
            "opacity 0.8s ease, transform 0.8s ease";

        observer.observe(section);

    }
);