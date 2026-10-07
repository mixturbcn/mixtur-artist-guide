/* =========================================
   MIXTUR ARTIST GUIDE · MAIN SCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const artistId = params.get("artist");

  let artistData = null;


  /* =========================================
     SHARED HELPERS
     ========================================= */

  const venueData = {
    "Fabra i Coats": {
      name: "Fabra i Coats",
      address: "Carrer de Sant Adrià, 20, 08030 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=Fabra+i+Coats+Barcelona"
    },

    "ESMUC": {
      name: "ESMUC",
      address: "Carrer de Padilla, 155, 08013 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=ESMUC+Barcelona"
    },

    "PHONOS": {
      name: "PHONOS",
      address: "Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=PHONOS+Barcelona"
    },

    "Museu de la Música": {
      name: "Museu de la Música",
      address:
        "L'Auditori, Carrer de Lepant, 150, 08013 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=Museu+de+la+Musica+Barcelona"
    },

    "TDM": {
      name: "TDM",
      address: "Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=TDM+Barcelona"
    },

    "CMMB": {
      name:
        "Conservatori Municipal de Música de Barcelona",
      address:
        "Carrer del Bruc, 110-112, 08009 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=Conservatori+Municipal+de+Musica+de+Barcelona"
    },

    "Santa Mònica": {
      name: "Santa Mònica",
      address: "La Rambla, 7, 08002 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=Santa+Monica+Barcelona+La+Rambla+7"
    },

    "L'Auditori": {
      name: "L'Auditori",
      address:
        "Carrer de Lepant, 150, 08013 Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=L%27Auditori+Barcelona"
    },

    "Espai Bota": {
      name: "Espai Bota",
      address: "Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=Espai+Bota+Barcelona"
    },

    "ALMO2BAR": {
      name: "ALMO2BAR",
      address: "Barcelona",
      maps:
        "https://www.google.com/maps/search/?api=1&query=ALMO2BAR+Barcelona"
    }
  };
   const externalVenueData =
     window.MIXTUR_VENUES || {};
   
   Object.assign(
     venueData,
     externalVenueData
   );


  function escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function normalizeText(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }


  function parseLocalDate(dateString) {
    if (!dateString) return null;

    const [year, month, day] =
      dateString
        .split("-")
        .map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(
      year,
      month - 1,
      day
    );
  }


  function formatDateLong(dateString) {
    const date =
      parseLocalDate(dateString);

    if (!date) return "";

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    ).format(date);
  }


  function formatDayNumberMonth(
    dateString
  ) {
    const date =
      parseLocalDate(dateString);

    if (!date) return "";

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "long"
      }
    ).format(date);
  }


  function formatWeekday(dateString) {
    const date =
      parseLocalDate(dateString);

    if (!date) return "";

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "long"
      }
    ).format(date);
  }


  function formatStayDates(
    stay = {}
  ) {
    const arrival =
      parseLocalDate(
        stay.arrivalDate
      );

    const departure =
      parseLocalDate(
        stay.departureDate
      );

    if (!arrival && !departure) {
      return "";
    }


    if (arrival && departure) {
      const sameMonth =
        arrival.getFullYear() ===
          departure.getFullYear() &&
        arrival.getMonth() ===
          departure.getMonth();


      if (sameMonth) {
        const month =
          new Intl.DateTimeFormat(
            "en-GB",
            {
              month: "long"
            }
          ).format(arrival);

        return (
          `${arrival.getDate()}–${departure.getDate()} ${month}`
        ).toUpperCase();
      }


      return (
        `${formatDayNumberMonth(
          stay.arrivalDate
        )} – ${formatDayNumberMonth(
          stay.departureDate
        )}`
      ).toUpperCase();
    }


    return formatDayNumberMonth(
      stay.arrivalDate ||
      stay.departureDate
    ).toUpperCase();
  }


  function activityLocation(
    activity = {}
  ) {
    if (activity.venue) {
      return activity.room
        ? `${activity.venue} · ${activity.room}`
        : activity.venue;
    }


    if (activity.hotel) {
      return activity.hotel;
    }


    if (activity.place) {
      return activity.place;
    }


    if (
      activity.from &&
      activity.to
    ) {
      return (
        `${activity.from} → ${activity.to}`
      );
    }


    if (activity.to) {
      return activity.to;
    }


    if (activity.from) {
      return activity.from;
    }


    return "";
  }


  function getMapsURL(
    activity = {}
  ) {
    if (
      activity.venue &&
      venueData[activity.venue]
    ) {
      return (
        venueData[
          activity.venue
        ].maps
      );
    }


    if (activity.hotel) {
      const query =
        artistData?.hotel?.address ||
        activity.hotel;

      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(query)
      );
    }


    if (activity.place) {
      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          activity.place +
          " Barcelona"
        )
      );
    }


    if (activity.to) {
      return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
          activity.to
        )
      );
    }


    return "";
  }


  function internalHref(
    page,
    hash = ""
  ) {
    if (!artistId) {
      return `${page}${hash}`;
    }

    return (
      `${page}?artist=` +
      `${encodeURIComponent(
        artistId
      )}${hash}`
    );
  }


  function preserveArtistInNavigation() {
    if (!artistId) {
      return;
    }


    document
      .querySelectorAll("a[href]")
      .forEach((link) => {
        const rawHref =
          link.getAttribute("href");


        if (
          !rawHref ||
          rawHref.startsWith("http") ||
          rawHref.startsWith("mailto:") ||
          rawHref.startsWith("tel:") ||
          rawHref.startsWith("#")
        ) {
          return;
        }


        const match =
          rawHref.match(
            /^(index\.html|schedule\.html|places\.html|info\.html)(#[^?]*)?$/
          );


        if (!match) {
          return;
        }


        link.setAttribute(
          "href",
          internalHref(
            match[1],
            match[2] || ""
          )
        );
      });
  }


  async function loadArtistData() {
    if (!artistId) {
      console.log(
        "Mixtur Artist Guide: no artist selected."
      );

      return null;
    }


    try {
      const response =
        await fetch(
          `artists/${encodeURIComponent(
            artistId
          )}.json`,
          {
            cache: "no-store"
          }
        );


      if (!response.ok) {
        throw new Error(
          `Artist file not found: ${response.status}`
        );
      }


      const data =
        await response.json();


      window.mixturArtistData =
        data;


      console.log(
        "Mixtur Artist Guide: artist loaded successfully",
        data
      );


      return data;

    } catch (error) {
      console.error(
        "Mixtur Artist Guide: could not load artist",
        error
      );

      return null;
    }
  }


  /* =========================================
     GENERIC SLIDE-UP PANELS
     ========================================= */

  function openPanel(panel) {
    if (!panel) {
      return;
    }


    panel.classList.add(
      "open"
    );

    panel.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "panel-open"
    );
  }


  function closePanel(panel) {
    if (!panel) {
      return;
    }


    panel.classList.remove(
      "open"
    );

    panel.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "panel-open"
    );
  }


  function initStaticPanels() {
    document
      .querySelectorAll(
        ".nearby-trigger, .info-panel-trigger"
      )
      .forEach((trigger) => {

        if (
          trigger.dataset
            .dynamicActivity ===
          "true"
        ) {
          return;
        }


        const activate = () => {
          const panelId =
            trigger.dataset.panel;

          if (!panelId) {
            return;
          }

          openPanel(
            document.getElementById(
              panelId
            )
          );
        };


        trigger.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            activate();
          }
        );


        trigger.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              activate();
            }
          }
        );
      });


    document
      .querySelectorAll(
        ".place-panel"
      )
      .forEach((panel) => {

        panel
          .querySelector(
            ".panel-backdrop"
          )
          ?.addEventListener(
            "click",
            () => {
              closePanel(panel);
            }
          );


        panel
          .querySelector(
            ".panel-close"
          )
          ?.addEventListener(
            "click",
            () => {
              closePanel(panel);
            }
          );
      });
  }


  function ensureActivityPanel() {
    let panel =
      document.getElementById(
        "activity-detail-panel"
      );


    if (panel) {
      return panel;
    }


    document.body
      .insertAdjacentHTML(
        "beforeend",
        `
        <div
          class="place-panel"
          id="activity-detail-panel"
          aria-hidden="true"
        >

          <div
            class="panel-backdrop"
          ></div>

          <div
            class="panel-sheet"
          >

            <div
              class="panel-handle"
            ></div>


            <button
              class="panel-close"
              type="button"
              aria-label="Close activity details"
            >
              ×
            </button>
            
            <div
              class="activity-panel-image"
              data-activity-panel-image
              hidden
            >
              <img
                src=""
                alt=""
                data-activity-panel-image-element
              >
            </div>

            <div
              class="panel-category"
              data-activity-panel-category
            ></div>


            <h2
              class="panel-title"
              data-activity-panel-title
            ></h2>


            <p
              class="panel-description"
              data-activity-panel-description
            ></p>


            <div
              class="panel-info"
              data-activity-panel-info
            ></div>


            <a
              class="panel-map-link"
              data-activity-panel-map
              target="_blank"
              rel="noopener noreferrer"
              hidden
            >
              Open in Maps →
            </a>
            
                  <div
                    class="place-nearby activity-panel-nearby"
                    data-activity-panel-nearby
                    hidden
                  >
                  
                    <a
                      href="javascript:void(0)"
                      data-activity-nearby-food
                    >
                      Nearby food
                      <span>→</span>
                    </a>
                  
                    <a
                      href="javascript:void(0)"
                      data-activity-nearby-essentials
                    >
                      Essentials
                      <span>→</span>
                    </a>
                  
                  </div>
                  
          </div>

        </div>
        `
      );


    panel =
      document.getElementById(
        "activity-detail-panel"
      );


    panel
      .querySelector(
        ".panel-backdrop"
      )
      ?.addEventListener(
        "click",
        () => {
          closePanel(panel);
        }
      );


    panel
      .querySelector(
        ".panel-close"
      )
      ?.addEventListener(
        "click",
        () => {
          closePanel(panel);
        }
      );


    return panel;
  }

   function ensureVenueNearbyPanel() {
  let panel =
    document.getElementById(
      "venue-nearby-panel"
    );

  if (panel) {
    return panel;
  }


  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="place-panel"
        id="venue-nearby-panel"
        aria-hidden="true"
      >

        <div
          class="panel-backdrop"
        ></div>

        <section
          class="panel-sheet"
        >

          <div
            class="panel-handle"
          ></div>


          <div
            class="panel-header"
          >

            <div>

              <p
                class="panel-location"
                data-venue-nearby-location
              ></p>

              <h2
                data-venue-nearby-title
              ></h2>

              <p
                class="panel-intro"
                data-venue-nearby-intro
              ></p>

            </div>


            <button
              class="panel-close"
              type="button"
              aria-label="Close"
            >
              ×
            </button>

          </div>


          <div
            class="panel-list"
            data-venue-nearby-list
          ></div>

        </section>

      </div>
    `
  );


  panel =
    document.getElementById(
      "venue-nearby-panel"
    );


  panel
    .querySelector(
      ".panel-backdrop"
    )
    ?.addEventListener(
      "click",
      () => {
        closePanel(panel);
      }
    );


  panel
    .querySelector(
      ".panel-close"
    )
    ?.addEventListener(
      "click",
      () => {
        closePanel(panel);
      }
    );


  return panel;
}


function openVenueNearby(venue, kind) {
  if (!venue) return;

  const items =
    kind === "food"
      ? venue.nearbyFood
      : venue.essentials;

  if (!Array.isArray(items) || !items.length) {
    return;
  }

  const panel = ensureVenueNearbyPanel();

  panel.querySelector(
    "[data-venue-nearby-location]"
  ).textContent = `Near ${venue.name}`;

  panel.querySelector(
    "[data-venue-nearby-title]"
  ).textContent =
    kind === "food"
      ? "Nearby food"
      : "Essentials";

  panel.querySelector(
    "[data-venue-nearby-intro]"
  ).textContent =
    kind === "food"
      ? "Selected recommendations near the venue"
      : "Useful places near the venue";

  const list = panel.querySelector(
    "[data-venue-nearby-list]"
  );

  list.innerHTML = items.map((item) => `
    <article class="panel-place">

      <div class="panel-place-meta">
        ${escapeHTML(item.type || "")}
      </div>

      <h3>
        ${escapeHTML(item.name || "")}
      </h3>

      ${
        item.description
          ? `<p>${escapeHTML(item.description)}</p>`
          : ""
      }

      ${
        item.address
          ? `<p class="venue-nearby-address">
               ${escapeHTML(item.address)}
             </p>`
          : ""
      }

      ${
        item.maps
          ? `<a
               href="${escapeHTML(item.maps)}"
               target="_blank"
               rel="noopener noreferrer"
             >
               Open in Maps
               <span>→</span>
             </a>`
          : ""
      }

    </article>
  `).join("");

   const activityPanel = document.getElementById(
    "activity-detail-panel"
  );

  if (
    activityPanel &&
    activityPanel.classList.contains("open")
  ) {
    activityPanel.classList.remove("open");

    activityPanel.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  openPanel(panel);
}
   
  function activityInfoRows(
    activity = {}
  ) {
    const rows = [];


    if (activity.venue) {
      rows.push([
        "Venue",
        activity.venue
      ]);
    }


    if (activity.room) {
      rows.push([
        "Room",
        activity.room
      ]);
    }


    if (activity.callTime) {
      rows.push([
        "Call time",
        activity.callTime
      ]);
    }


    if (activity.hotel) {
      rows.push([
        "Hotel",
        activity.hotel
      ]);
    }


    if (activity.place) {
      rows.push([
        "Place",
        activity.place
      ]);
    }


    if (activity.from) {
      rows.push([
        "From",
        activity.from
      ]);
    }


    if (activity.to) {
      rows.push([
        "To",
        activity.to
      ]);
    }


    if (activity.transport) {
      rows.push([
        "Transport",
        activity.transport
      ]);
    }


    if (activity.notes) {
      rows.push([
        "Notes",
        activity.notes
      ]);
    }


    if (
      artistData
        ?.mainContact
        ?.name
    ) {
      rows.push([
        "Contact",

        `${artistData.mainContact.name}${
          artistData.mainContact.role
            ? ` · ${artistData.mainContact.role}`
            : ""
        }`
      ]);
    }


    return rows;
  }


  function openActivityDetail(
    activity
  ) {
    if (!activity) {
      return;
    }


    const panel =
      ensureActivityPanel();

     const venue =
  activity.venue
    ? venueData[
        activity.venue
      ]
    : null;


const imageWrapper =
  panel.querySelector(
    "[data-activity-panel-image]"
  );


const imageElement =
  panel.querySelector(
    "[data-activity-panel-image-element]"
  );


if (
  venue?.image &&
  imageWrapper &&
  imageElement
) {
  imageElement.src =
    venue.image;

  imageElement.alt =
    venue.name || "Venue";

  imageWrapper.hidden =
    false;

} else if (imageWrapper) {
  imageWrapper.hidden =
    true;
}


    panel.querySelector(
      "[data-activity-panel-category]"
    ).textContent =
      activity.type ||
      "Activity";


    panel.querySelector(
      "[data-activity-panel-title]"
    ).textContent =
      activity.title ||
      activity.type ||
      "Activity";


    const dateText =
      formatDateLong(
        activity.date
      );


    const description =
      [
        dateText,
        activity.time
      ]
        .filter(Boolean)
        .join(" · ");


    panel.querySelector(
      "[data-activity-panel-description]"
    ).textContent =
      description;


    const info =
      panel.querySelector(
        "[data-activity-panel-info]"
      );


    info.innerHTML =
      activityInfoRows(
        activity
      )
        .map(
          ([label, value]) => `
            <div
              class="panel-info-row"
            >
              <span
                class="panel-info-label"
              >
                ${escapeHTML(label)}
              </span>

              <span
                class="panel-info-value"
              >
                ${escapeHTML(value)}
              </span>
            </div>
          `
        )
        .join("");


    const mapLink =
      panel.querySelector(
        "[data-activity-panel-map]"
      );


    const mapsURL =
      getMapsURL(
        activity
      );


    if (mapsURL) {
      mapLink.href =
        mapsURL;

      mapLink.hidden =
        false;

    } else {
      mapLink.removeAttribute(
        "href"
      );

      mapLink.hidden =
        true;
    }

   const nearbyBlock =
  panel.querySelector(
    "[data-activity-panel-nearby]"
  );


const foodTrigger =
  panel.querySelector(
    "[data-activity-nearby-food]"
  );


const essentialsTrigger =
  panel.querySelector(
    "[data-activity-nearby-essentials]"
  );


const hasFood =
  Array.isArray(
    venue?.nearbyFood
  ) &&
  venue.nearbyFood.length > 0;


const hasEssentials =
  Array.isArray(
    venue?.essentials
  ) &&
  venue.essentials.length > 0;


if (
  nearbyBlock &&
  (hasFood || hasEssentials)
) {
  nearbyBlock.hidden =
    false;


  if (foodTrigger) {
    foodTrigger.hidden =
      !hasFood;

    foodTrigger.onclick =
      (event) => {
        event.preventDefault();
         event.stopPropagation();

        openVenueNearby(
          venue,
          "food"
        );
      };
  }


  if (essentialsTrigger) {
    essentialsTrigger.hidden =
      !hasEssentials;

    essentialsTrigger.onclick =
      (event) => {
        event.preventDefault();
         event.stopPropagation();

        openVenueNearby(
          venue,
          "essentials"
        );
      };
  }

} else if (nearbyBlock) {
  nearbyBlock.hidden =
    true;
}
     
    openPanel(panel);
  }


 function initDynamicActivityDelegation() {

  function activate(trigger) {
    if (
      !trigger ||
      !Array.isArray(
        artistData?.schedule
      )
    ) {
      return;
    }


    /* NEXT UP WHITE CARD */

    if (
      trigger.classList.contains(
        "next-card"
      )
    ) {
      const schedule =
        artistData.schedule
          .map(
            (activity, index) => ({
              ...activity,
              __index: index
            })
          )
          .sort(
            (a, b) => {
              const dateA =
                activityDateTime(a);

              const dateB =
                activityDateTime(b);

              return (
                (dateA?.getTime() || 0) -
                (dateB?.getTime() || 0)
              );
            }
          );


      const nextActivity =
        chooseNextActivity(
          schedule
        );


      if (nextActivity) {
        openActivityDetail(
          nextActivity
        );
      }

      return;
    }


    /* TODAY + SCHEDULE */

    const index =
      Number(
        trigger.dataset
          .activityIndex
      );


    if (
      !Number.isInteger(index) ||
      !artistData.schedule[index]
    ) {
      return;
    }


    openActivityDetail(
      artistData.schedule[index]
    );
  }


  document.addEventListener(
    "click",
    (event) => {

      const trigger =
        event.target.closest(
          ".next-card, [data-activity-index]"
        );


      if (!trigger) {
        return;
      }


      event.preventDefault();

      activate(trigger);
    }
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }


      const trigger =
        event.target.closest(
          ".next-card, [data-activity-index]"
        );


      if (!trigger) {
        return;
      }


      event.preventDefault();

      activate(trigger);
    }
  );
}


  /* =========================================
     TODAY · ARTIST DATA
     ========================================= */

  function activityDateTime(activity = {}) {
    if (!activity.date) return null;
    const date = new Date(`${activity.date}T${activity.time || "00:00"}:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function chooseTodayDate(schedule = []) {
    const dated = schedule
      .filter((activity) => activity.date)
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    if (!dated.length) return "";

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");

    if (dated.some((activity) => activity.date === today)) return today;

    const nextDay = dated.find((activity) => activity.date > today);
    return nextDay ? nextDay.date : dated[dated.length - 1].date;
  }


     /* =========================================
   TODAY · DYNAMIC ARTIST VIEW
   ========================================= */

function renderTodayPage() {
  if (!artistData) {
    return;
  }


  /* -----------------------------------------
     WELCOME
     ----------------------------------------- */

  const welcomeTitle =
    document.querySelector(
      ".welcome"
    );


  if (
    welcomeTitle &&
    artistData.artist?.name
  ) {
    const artistName =
      artistData.artist.name
        .trim()
        .toUpperCase();


    /* Reset adaptive classes */

    welcomeTitle.classList.remove(
      "welcome-medium",
      "welcome-long"
    );


    /* Adapt typography to longer artist names */

    if (artistName.length >= 16) {
      welcomeTitle.classList.add(
        "welcome-long"
      );
    } else if (
      artistName.length >= 11
    ) {
      welcomeTitle.classList.add(
        "welcome-medium"
      );
    }


    welcomeTitle.innerHTML =
      `WELCOME,<br><span class="welcome-artist-name">${escapeHTML(
        artistName
      )}</span>`;
  }

  /* -----------------------------------------
     PERSONAL SCHEDULE DATE RANGE
     ----------------------------------------- */

  const schedule =
    Array.isArray(
      artistData.schedule
    )
      ? artistData.schedule
          .map(
            (activity, index) => ({
              ...activity,
              __index: index
            })
          )
          .filter(
            (activity) =>
              activity.date
          )
          .sort(
            (a, b) => {
              const dateA =
                `${a.date}T${a.time || "00:00"}`;

              const dateB =
                `${b.date}T${b.time || "00:00"}`;

              return dateA.localeCompare(
                dateB
              );
            }
          )
      : [];


  if (!schedule.length) {
    renderTodayContact();
    return;
  }


  const firstDate =
    schedule[0].date;

  const lastDate =
    schedule[
      schedule.length - 1
    ].date;


  const stayDatesElement =
    document.querySelector(
      ".stay-dates"
    );


  if (stayDatesElement) {
    stayDatesElement.innerHTML =
      `${formatArtistScheduleRange(
        firstDate,
        lastDate
      )}<br>Barcelona`;
  }


  /* -----------------------------------------
     SELECT DAY
     ----------------------------------------- */

  const selectedDate =
    chooseTodayDate(
      schedule
    );


  const dayActivities =
    schedule.filter(
      (activity) =>
        activity.date ===
        selectedDate
    );


  /* -----------------------------------------
     NEXT UP
     ----------------------------------------- */

  const nextActivity =
    chooseNextActivity(
      schedule
    );


  renderTodayNextUp(
    nextActivity
  );


  /* -----------------------------------------
     TODAY SCHEDULE
     ----------------------------------------- */

  renderTodaySchedule(
    selectedDate,
    dayActivities,
    nextActivity
  );


  renderTodayContact();
}



/* =========================================
   PERSONAL SCHEDULE RANGE
   ========================================= */

function formatArtistScheduleRange(
  firstDate,
  lastDate
) {
  if (
    !firstDate ||
    !lastDate
  ) {
    return "";
  }


  const first =
    new Date(
      `${firstDate}T12:00:00`
    );

  const last =
    new Date(
      `${lastDate}T12:00:00`
    );


  const firstDay =
    String(
      first.getDate()
    ).padStart(
      2,
      "0"
    );

  const lastDay =
    String(
      last.getDate()
    ).padStart(
      2,
      "0"
    );


  const firstMonth =
    first
      .toLocaleDateString(
        "en-GB",
        {
          month: "short"
        }
      )
      .toUpperCase();

  const lastMonth =
    last
      .toLocaleDateString(
        "en-GB",
        {
          month: "short"
        }
      )
      .toUpperCase();


  const firstYear =
    first.getFullYear();

  const lastYear =
    last.getFullYear();


  if (
    firstDate ===
    lastDate
  ) {
    return (
      `${firstDay} ${firstMonth} ${firstYear}`
    );
  }


  if (
    firstMonth === lastMonth &&
    firstYear === lastYear
  ) {
    return (
      `${firstDay} → ${lastDay} ${lastMonth} ${lastYear}`
    );
  }


  if (
    firstYear === lastYear
  ) {
    return (
      `${firstDay} ${firstMonth} → ${lastDay} ${lastMonth} ${lastYear}`
    );
  }


  return (
    `${firstDay} ${firstMonth} ${firstYear} → ` +
    `${lastDay} ${lastMonth} ${lastYear}`
  );
}



/* =========================================
   NEXT ACTIVITY
   ========================================= */

function chooseNextActivity(schedule) {
  if (
    !Array.isArray(schedule) ||
    !schedule.length
  ) {
    return null;
  }


  const now =
    new Date();


  const validSchedule =
    schedule.filter(
      (activity) =>
        activityDateTime(activity)
    );


  if (!validSchedule.length) {
    return null;
  }


  /* -----------------------------------------
     1. FUTURE ACTIVITY
     ----------------------------------------- */

  const futureActivity =
    validSchedule.find(
      (activity) => {
        const date =
          activityDateTime(activity);

        return (
          date &&
          date.getTime() >=
            now.getTime()
        );
      }
    );


  if (futureActivity) {
    return futureActivity;
  }


  /* -----------------------------------------
     2. NO FUTURE ACTIVITIES
     KEEP TODAY'S LAST ACTIVITY AS CURRENT
     ----------------------------------------- */

  const today =
    [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, "0"),
      String(
        now.getDate()
      ).padStart(2, "0")
    ].join("-");


  const todayActivities =
    validSchedule.filter(
      (activity) =>
        activity.date === today
    );


  if (todayActivities.length) {
    return todayActivities[
      todayActivities.length - 1
    ];
  }


  /* -----------------------------------------
     3. SCHEDULE COMPLETE
     ----------------------------------------- */

  return null;
}


/* =========================================
   NEXT UP · TIME REMAINING
   ========================================= */

function formatTimeUntilActivity(
  activity
) {
  if (
    !activity?.date ||
    !activity?.time
  ) {
    return "";
  }


  const now =
    new Date();


  const activityDate =
    new Date(
      `${activity.date}T${activity.time}:00`
    );


  const difference =
    activityDate.getTime() -
    now.getTime();


  /* ACTIVITY HAS ALREADY STARTED TODAY */

  if (difference < 0) {
    const today =
      [
        now.getFullYear(),
        String(
          now.getMonth() + 1
        ).padStart(2, "0"),
        String(
          now.getDate()
        ).padStart(2, "0")
      ].join("-");


    if (
      activity.date === today
    ) {
      return "Current";
    }


    return "";
  }


  /* STARTING NOW */

  if (difference === 0) {
    return "Now";
  }


  const totalMinutes =
    Math.ceil(
      difference / 60000
    );


  if (totalMinutes < 60) {
    return `in ${totalMinutes} min`;
  }


  const hours =
    Math.floor(
      totalMinutes / 60
    );


  const minutes =
    totalMinutes % 60;


  if (hours < 24) {
    if (!minutes) {
      return `in ${hours} h`;
    }

    return (
      `in ${hours} h ${minutes} min`
    );
  }


  const days =
    Math.floor(
      hours / 24
    );


  const remainingHours =
    hours % 24;


  if (!remainingHours) {
    return (
      `in ${days} ${
        days === 1
          ? "day"
          : "days"
      }`
    );
  }


  return (
    `in ${days} ${
      days === 1
        ? "day"
        : "days"
    } ${remainingHours} h`
  );
}

/* =========================================
   NEXT UP CARD
   ========================================= */

function renderTodayNextUp(activity) {
  const nextCard =
    document.querySelector(
      ".next-card"
    );

  const nextSection =
    document.querySelector(
      ".next-section"
    );

  const countdown =
    nextSection?.querySelector(
      ".section-label span:last-child"
    );

  if (!nextCard) {
    return;
  }


  /* NEXT UP IS INFORMATION ONLY */

  nextCard.removeAttribute(
    "data-activity-index"
  );

  nextCard.removeAttribute(
    "data-dynamic-activity"
  );

  nextCard.removeAttribute(
    "role"
  );

  nextCard.removeAttribute(
    "tabindex"
  );

  nextCard.onclick = null;
  nextCard.onkeydown = null;


  const arrow =
    nextCard.querySelector(
      ".arrow-button"
    );

  if (arrow) {
    arrow.remove();
  }


  /* SCHEDULE COMPLETE */

  if (!activity) {
    nextCard.hidden = true;

    if (countdown) {
      countdown.textContent =
        "Schedule complete";
    }

    return;
  }


  /* NEXT ACTIVITY */

  nextCard.hidden = false;

  if (countdown) {
    countdown.textContent =
      formatTimeUntilActivity(
        activity
      );
  }


  const time =
    nextCard.querySelector(
      ".next-time"
    );

  const title =
    nextCard.querySelector(
      ".next-title"
    );

  const place =
    nextCard.querySelector(
      ".next-place"
    );


  if (time) {
    time.textContent =
      activity.time || "";
  }

  if (title) {
    title.textContent =
      activity.type ||
      "Activity";
  }

  if (title) {
  const isOther =
    normalizeText(activity.type) ===
    "other";

  title.textContent =
    isOther
      ? (
          activity.title ||
          activity.type ||
          "Activity"
        )
      : (
          activity.type ||
          "Activity"
        );
  }
}
   
/* =========================================
   TODAY SCHEDULE
   ========================================= */

function renderTodaySchedule(
  selectedDate,
  activities,
  nextActivity
) {
  const container =
    document.querySelector(
      ".today-list"
    );


  if (!container) {
    return;
  }


  const formattedHeading =
    formatTodayHeading(
      selectedDate
    );


  const rows =
    activities
      .map(
        (activity) => {

          const isNext =
            nextActivity &&
            activity.__index ===
              nextActivity.__index;


          const location =
            activityLocation(
              activity
            );


          return `
            <article
              class="today-item${
                isNext
                  ? " highlight"
                  : ""
              }"
              data-dynamic-activity="true"
              data-activity-index="${activity.__index}"
              role="button"
              tabindex="0"
              aria-label="Open ${escapeHTML(
                activity.type ||
                "activity"
              )} details"
            >

              <div
                 class="today-time"
               >
                 ${escapeHTML(
                   activity.time || ""
                 )}
               </div>


              <div
                class="today-info"
              >

                <div
                 class="today-title"
               >
                 ${escapeHTML(
                   normalizeText(activity.type) === "other"
                     ? (activity.title || activity.type || "Activity")
                     : (activity.type || "Activity")
                 )}
               </div>


                ${
                  location
                    ? `
                      <div
                        class="today-place"
                      >
                        ${escapeHTML(
                          location
                        )}
                      </div>
                    `
                    : ""
                }

              </div>


              <div
                class="today-arrow"
              >
                →
              </div>

            </article>
          `;
        }
      )
      .join("");


  container.innerHTML = `
    <div
      class="section-label schedule-heading"
    >
      <span>
        ${escapeHTML(
          formattedHeading
        )}
      </span>

      <span>
        Today
      </span>
    </div>

    ${rows}
  `;
}



/* =========================================
   TODAY DATE HEADING
   ========================================= */

function formatTodayHeading(
  dateString
) {
  if (!dateString) {
    return "";
  }


  const date =
    new Date(
      `${dateString}T12:00:00`
    );


  const weekday =
    date.toLocaleDateString(
      "en-GB",
      {
        weekday: "long"
      }
    );


  const day =
    date.getDate();


  const month =
    date.toLocaleDateString(
      "en-GB",
      {
        month: "long"
      }
    );


  return (
    `${weekday} · ${day} ${month}`
  );
}


  function renderTodayContact() {
     if (!artistData?.mainContact) {
       return;
     }
   
     const contact = artistData.mainContact;
   
     const contactArea =
       document.querySelector(".today-contact-card") ||
       document.querySelector(".contact-card") ||
       document.querySelector("#my-contact");
   
     if (!contactArea) {
       return;
     }
   
     /* NAME */
   
     const name =
       contactArea.querySelector(
         ".contact-name, [data-contact-name], h3"
       );
   
     if (name) {
       name.textContent = contact.name || "";
     }
   
   
     /* ROLE */
   
     const role =
       contactArea.querySelector(
         ".contact-role, [data-contact-role]"
       );
   
     if (role) {
       role.textContent = contact.role || "";
     }
   
   
     /* PHONE */
   
     const phone =
       String(contact.phone || "").trim();
   
     const phoneDigits =
       phone.replace(/\D/g, "");
   
   
     /* WHATSAPP */
   
     const whatsappLink =
       contactArea.querySelector(
         '[data-contact-whatsapp], a[href*="wa.me"], a[href*="whatsapp"]'
       );
   
     if (whatsappLink && phoneDigits) {
       whatsappLink.href =
         `https://wa.me/${phoneDigits}`;
   
       whatsappLink.target = "_blank";
       whatsappLink.rel = "noopener";
     }
   
   
     /* CALL */
   
     const callLink =
       contactArea.querySelector(
         '[data-contact-call], a[href^="tel:"]'
       );
   
     if (callLink && phone) {
       callLink.href =
         `tel:${phone}`;
     }
   }

  /* =========================================
     SCHEDULE · DYNAMIC
     ========================================= */

  function findScheduleContainer() {
  const existingDays =
    document.querySelectorAll(
      ".schedule-day"
    );

  if (!existingDays.length) {
    return null;
  }

  let container =
    document.querySelector(
      "#dynamic-schedule"
    );

  if (container) {
    return container;
  }

  container =
    document.createElement(
      "div"
    );

  container.id =
    "dynamic-schedule";

  existingDays[0]
    .parentNode
    .insertBefore(
      container,
      existingDays[0]
    );

  existingDays.forEach(
    (day) => {
      day.remove();
    }
  );

  return container;
}

  function groupScheduleByDate(
    schedule
  ) {
    const groups = {};


    schedule.forEach(
      (activity, index) => {
        if (!activity.date) {
          return;
        }


        if (
          !groups[
            activity.date
          ]
        ) {
          groups[
            activity.date
          ] = [];
        }


        groups[
          activity.date
        ].push({
          ...activity,
          __index: index
        });
      }
    );


    return groups;
  }


  function renderSchedulePage() {
  if (
    !artistData ||
    !Array.isArray(
      artistData.schedule
    )
  ) {
    return;
  }


  const container =
    findScheduleContainer();


  if (!container) {
    makeExistingScheduleRowsClickable();

    return;
  }


  const groups =
    groupScheduleByDate(
      artistData.schedule
    );


  const dates =
    Object.keys(groups)
      .sort();


  if (!dates.length) {
    return;
  }


  /* TODAY */

  const now =
    new Date();

  const today =
    [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, "0"),
      String(
        now.getDate()
      ).padStart(2, "0")
    ].join("-");


  container.innerHTML =
    dates
      .map(
        (date) => {

          const isToday =
            date === today;


          return `
            <section
              class="schedule-day${
                isToday
                  ? " today-day"
                  : ""
              }"
            >

              <div
                class="day-header"
              >

                <span>
                  ${escapeHTML(
                    formatWeekday(
                      date
                    )
                  )}
                </span>

                <span>
                  ${escapeHTML(
                    formatDayNumberMonth(
                      date
                    )
                  )}${
                    isToday
                      ? " · TODAY"
                      : ""
                  }
                </span>

              </div>


              <div
                class="schedule-day-events"
              >

                ${groups[date]
                  .map(
                    (
                      activity
                    ) => `
                      <article
                        class="schedule-event info-panel-trigger"
                        data-dynamic-activity="true"
                        data-activity-index="${activity.__index}"
                        role="button"
                        tabindex="0"
                        aria-label="Open ${escapeHTML(
                          activity.title ||
                          activity.type ||
                          "activity"
                        )} details"
                      >

                        <div
                          class="schedule-time"
                        >
                          ${escapeHTML(
                            activity.time || ""
                          )}
                        </div>


                        <div
                          class="schedule-event-info"
                        >

                          <div
                            class="schedule-event-type"
                          >
                            ${escapeHTML(
                              activity.type || ""
                            )}
                          </div>


                          <h2>
                            ${escapeHTML(
                              activity.title ||
                              activity.type ||
                              "Activity"
                            )}
                          </h2>


                          ${
                            activityLocation(
                              activity
                            )
                              ? `
                                <p>
                                  ${escapeHTML(
                                    activityLocation(
                                      activity
                                    )
                                  )}
                                </p>
                              `
                              : ""
                          }

                        </div>


                        <div
                          class="schedule-event-arrow"
                        >
                          →
                        </div>

                      </article>
                    `
                  )
                  .join("")}

              </div>

            </section>
          `;
        }
      )
      .join("");
}

  function makeExistingScheduleRowsClickable() {
    const rows =
      document.querySelectorAll(
        ".schedule-event"
      );


    rows.forEach(
      (row, index) => {
        const activity =
          artistData.schedule[
            index
          ];

        if (!activity) {
          return;
        }


        row.dataset.activityIndex =
          String(index);

        row.dataset.dynamicActivity =
          "true";

        row.setAttribute(
          "role",
          "button"
        );

        row.setAttribute(
          "tabindex",
          "0"
        );
      }
    );
  }


  /* =========================================
     PLACES · FILTERS
     ========================================= */

  function initPlacesFilters() {
    const filterButtons =
      document.querySelectorAll(
        ".place-filter, .filter-button"
      );


    const placeCards =
      document.querySelectorAll(
        ".featured-place, .place-card"
      );


    if (
      !filterButtons.length ||
      !placeCards.length
    ) {
      return;
    }


    filterButtons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const filter =
              button.dataset.filter ||
              normalizeText(
                button.textContent
              );


            filterButtons.forEach(
              (item) => {
                item.classList.remove(
                  "active"
                );
              }
            );


            button.classList.add(
              "active"
            );


            placeCards.forEach(
              (card) => {
                const category =
                  normalizeText(
                    card.dataset
                      .category || ""
                  );


                const hasFood =
                  card.dataset.food ===
                  "true";


                let visible = false;


                if (
                  filter === "all"
                ) {
                  visible = true;
                }


                if (
                  filter ===
                    "venues" ||
                  filter ===
                    "venue"
                ) {
                  visible =
                    category ===
                      "venues" ||
                    category ===
                      "venue";
                }


                if (
                  filter === "food"
                ) {
                  visible =
                    hasFood ||
                    category ===
                      "food";
                }


                if (
                  filter === "other"
                ) {
                  visible =
                    category ===
                    "other";
                }


                card.hidden =
                  !visible;

                card.style.display =
                  visible
                    ? ""
                    : "none";
              }
            );
          }
        );
      }
    );
  }


  /* =========================================
     PLACES · MAP LINKS
     ========================================= */

  function repairPlacesMapLinks() {
    const cards =
      document.querySelectorAll(
        ".featured-place, .place-card"
      );


    cards.forEach(
      (card) => {
        const titleElement =
          card.querySelector(
            "h2, h3, .place-title"
          );


        const title =
          titleElement?.textContent
            ?.trim();


        if (!title) {
          return;
        }


        let mapsURL = "";


        const exactVenue =
          Object.keys(
            venueData
          ).find(
            (venue) =>
              normalizeText(
                title
              ).includes(
                normalizeText(
                  venue
                )
              )
          );


        if (exactVenue) {
          mapsURL =
            venueData[
              exactVenue
            ].maps;
        }


        if (
          !mapsURL &&
          artistData?.hotel?.name &&
          normalizeText(
            title
          ).includes(
            normalizeText(
              artistData.hotel.name
            )
          )
        ) {
          const hotelQuery =
            artistData.hotel
              .address ||
            artistData.hotel
              .name;


          mapsURL =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(
              hotelQuery
            );
        }


        const links =
          card.querySelectorAll(
            "a"
          );


        links.forEach(
          (link) => {
            const text =
              normalizeText(
                link.textContent
              );


            if (
              text.includes(
                "open in maps"
              ) ||
              text.includes(
                "maps"
              ) ||
              link.classList.contains(
                "place-map-link"
              )
            ) {
              if (mapsURL) {
                link.href =
                  mapsURL;

                link.target =
                  "_blank";

                link.rel =
                  "noopener noreferrer";
              }
            }
          }
        );
      }
    );
  }

/* =========================================
   PLACES · ARTIST VENUES
   ========================================= */

function renderVenueDataInPlaces() {
  const container =
    document.querySelector(
      "[data-places-list]"
    );


  if (
    !container ||
    !Array.isArray(
      artistData?.schedule
    )
  ) {
    return;
  }


  /* -----------------------------------------
     UNIQUE VENUES FROM ARTIST SCHEDULE
     ----------------------------------------- */

  const venueNames = [];


  artistData.schedule.forEach(
    (activity) => {

      const venueName =
        activity.venue;


      if (
        !venueName ||
        !venueData[venueName] ||
        venueNames.includes(
          venueName
        )
      ) {
        return;
      }


      venueNames.push(
        venueName
      );
    }
  );


  /* -----------------------------------------
     BUILD VENUE CARDS
     ----------------------------------------- */

  const venueCards =
    venueNames
      .map(
        (venueName) => {

          const venue =
            venueData[
              venueName
            ];


          const hasFood =
            Array.isArray(
              venue.nearbyFood
            ) &&
            venue.nearbyFood.length > 0;


          const hasEssentials =
            Array.isArray(
              venue.essentials
            ) &&
            venue.essentials.length > 0;


          return `
            <article
              class="featured-place"
              data-category="${
                venueName === "Sala Taro"
                  ? "other"
                  : "venues"
              }"
              data-food="${
                hasFood
                  ? "true"
                  : "false"
              }"
            >

              <div
                class="featured-place-image${
                  venue.image
                    ? ""
                    : " placeholder-image"
                }"
              >

                ${
                  venue.image
                    ? `
                      <img
                        src="${escapeHTML(
                          venue.image
                        )}"
                        alt="${escapeHTML(
                          venue.name
                        )}"
                        loading="lazy"
                      >
                    `
                    : `
                      <span>
                        Venue
                      </span>
                    `
                }

              </div>


              <div
                class="featured-place-content"
              >

                <div
                  class="place-category"
                >
                  Venue
                </div>


                <div
                  class="place-title-row"
                >

                  <div>

                    <h2>
                      ${escapeHTML(
                        venue.name
                      )}
                    </h2>


                    ${
                      venue.description ||
                      venue.fullName
                        ? `
                          <p
                            class="place-description"
                          >
                            ${escapeHTML(
                              venue.description ||
                              venue.fullName
                            )}
                          </p>
                        `
                        : ""
                    }

                  </div>


                  <span
                    class="place-arrow"
                  >
                    →
                  </span>

                </div>


                ${
                  venue.address
                    ? `
                      <address
                        class="place-address"
                      >
                        ${escapeHTML(
                          venue.address
                        )}
                      </address>
                    `
                    : ""
                }


                ${
                  venue.maps
                    ? `
                      <a
                        class="maps-link"
                        href="${escapeHTML(
                          venue.maps
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >

                        <span
                          class="maps-symbol"
                        >
                          ⌖
                        </span>

                        <span>
                          Open in Maps
                        </span>

                        <span
                          class="maps-arrow"
                        >
                          →
                        </span>

                      </a>
                    `
                    : ""
                }


                ${
                  hasFood ||
                  hasEssentials
                    ? `
                      <div
                        class="place-nearby"
                      >

                        ${
                          hasFood
                            ? `
                              <a
                                href="#"
                                data-venue-food="${escapeHTML(
                                  venueName
                                )}"
                              >
                                Nearby food
                                <span>→</span>
                              </a>
                            `
                            : ""
                        }


                        ${
                          hasEssentials
                            ? `
                              <a
                                href="#"
                                data-venue-essentials="${escapeHTML(
                                  venueName
                                )}"
                              >
                                Essentials
                                <span>→</span>
                              </a>
                            `
                            : ""
                        }

                      </div>
                    `
                    : ""
                }

              </div>

            </article>
          `;
        }
      )
      .join("");


  container.innerHTML =
    venueCards;


  /* -----------------------------------------
     NEARBY FOOD
     ----------------------------------------- */

  container
    .querySelectorAll(
      "[data-venue-food]"
    )
    .forEach(
      (trigger) => {

        trigger.addEventListener(
          "click",
          (event) => {
            event.preventDefault();


            const venue =
              venueData[
                trigger.dataset
                  .venueFood
              ];


            openVenueNearby(
              venue,
              "food"
            );
          }
        );
      }
    );


  /* -----------------------------------------
     ESSENTIALS
     ----------------------------------------- */

  container
    .querySelectorAll(
      "[data-venue-essentials]"
    )
    .forEach(
      (trigger) => {

        trigger.addEventListener(
          "click",
          (event) => {
            event.preventDefault();


            const venue =
              venueData[
                trigger.dataset
                  .venueEssentials
              ];


            openVenueNearby(
              venue,
              "essentials"
            );
          }
        );
      }
    );
}

function renderArtistHotelInPlaces() {
  const container =
    document.querySelector(
      "[data-places-list]"
    );


  const hotel =
    artistData?.hotel;


  if (
    !container ||
    !hotel?.name
  ) {
    return;
  }


  const mapURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
      hotel.address ||
      hotel.name
    );


  const hotelCard = `
    <article
      class="featured-place"
      id="my-hotel"
      data-artist-hotel="true"
      data-category="other"
      data-food="false"
    >

      <div
        class="featured-place-image placeholder-image"
      >
        <span>
          Hotel
        </span>
      </div>


      <div
        class="featured-place-content"
      >

        <div
          class="place-category"
        >
          Hotel
        </div>


        <div
          class="place-title-row"
        >

          <div>

            <h2>
              ${escapeHTML(
                hotel.name
              )}
            </h2>

            <p
              class="place-description"
            >
              Artist accommodation
            </p>

          </div>


          <span
            class="place-arrow"
          >
            →
          </span>

        </div>


        ${
          hotel.address
            ? `
              <address
                class="place-address"
              >
                ${escapeHTML(
                  hotel.address
                )}
              </address>
            `
            : ""
        }


        <a
          class="maps-link"
          href="${escapeHTML(
            mapURL
          )}"
          target="_blank"
          rel="noopener noreferrer"
        >

          <span
            class="maps-symbol"
          >
            ⌖
          </span>

          <span>
            Open in Maps
          </span>

          <span
            class="maps-arrow"
          >
            →
          </span>

        </a>

      </div>

    </article>
  `;


  container.insertAdjacentHTML(
    "beforeend",
    hotelCard
  );
}




  /* =========================================
     INFO · ACCORDIONS
     ========================================= */

  function initInfoAccordion() {
    const infoSections =
      document.querySelectorAll(
        ".info-section"
      );


    infoSections.forEach(
      (section) => {
        const button =
          section.querySelector(
            ".info-toggle, .info-section-toggle"
          );


        if (!button) {
          return;
        }


        button.addEventListener(
          "click",
          () => {
            const isOpen =
              section.classList.contains(
                "open"
              );


            infoSections.forEach(
              (item) => {
                item.classList.remove(
                  "open"
                );


                const itemButton =
                  item.querySelector(
                    ".info-toggle, .info-section-toggle"
                  );


                itemButton?.setAttribute(
                  "aria-expanded",
                  "false"
                );
              }
            );


            if (!isOpen) {
              section.classList.add(
                "open"
              );


              button.setAttribute(
                "aria-expanded",
                "true"
              );
            }
          }
        );
      }
    );


    return infoSections;
  }


  /* =========================================
     INFO · ARTIST DATA
     ========================================= */

  function setTextIfFound(
    selectors,
    value
  ) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }


    selectors.forEach(
      (selector) => {
        document
          .querySelectorAll(
            selector
          )
          .forEach(
            (element) => {
              element.textContent =
                value;
            }
          );
      }
    );
  }


  function renderInfoArtistData() {
  if (!artistData) {
    return;
  }

  const stay = artistData.stay || {};
  const hotel = artistData.hotel || null;
  const contact = artistData.mainContact || {};

  /* =========================================
     HELPERS
     ========================================= */

  function formatInfoDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = parseLocalDate(dateString);

    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short"
    })
      .format(date)
      .toUpperCase();
  }

  function setInfoText(selector, value) {
    const element = document.querySelector(selector);

    if (element && value) {
      element.textContent = value;
    }
  }

  /* =========================================
     ARRIVAL
     ========================================= */

  const arrivalCard =
    document.querySelector("[data-stay-arrival]");

  const hasArrival =
    stay.arrivalDate ||
    stay.arrivalTime ||
    stay.arrivalPlace;

  if (arrivalCard) {
    if (!hasArrival) {
      arrivalCard.style.display = "none";
    } else {
      arrivalCard.style.display = "";

      setInfoText(
        "[data-arrival-date]",
        formatInfoDate(stay.arrivalDate)
      );

      setInfoText(
        "[data-arrival-time]",
        stay.arrivalTime
      );

      setInfoText(
        "[data-arrival-place]",
        stay.arrivalPlace
      );
    }
  }

  /* =========================================
     ACCOMMODATION
     ========================================= */

  const hotelCard =
    document.querySelector("[data-stay-hotel]");

  if (hotelCard) {
    if (!hotel) {
      hotelCard.style.display = "none";
    } else {
      hotelCard.style.display = "";

      setInfoText(
        "[data-hotel-name]",
        hotel.name
      );

      const hotelSummaryParts = [];

      if (hotel.checkInDate) {
        hotelSummaryParts.push(
          `Check-in · ${formatInfoDate(hotel.checkInDate)}`
        );
      }

      if (hotel.checkInTime) {
        hotelSummaryParts.push(
          hotel.checkInTime
        );
      }

      if (
        !hotel.checkInDate &&
        !hotel.checkInTime &&
        hotel.address
      ) {
        hotelSummaryParts.push(
          hotel.address
        );
      }

      setInfoText(
        "[data-hotel-summary]",
        hotelSummaryParts.join(" · ")
      );
    }
  }

  /* =========================================
     DEPARTURE
     ========================================= */

  const departureCard =
    document.querySelector("[data-stay-departure]");

  const hasDeparture =
    stay.departureDate ||
    stay.departureTime ||
    stay.departurePlace;

  if (departureCard) {
    if (!hasDeparture) {
      departureCard.style.display = "none";
    } else {
      departureCard.style.display = "";

      setInfoText(
        "[data-departure-date]",
        formatInfoDate(stay.departureDate)
      );

      setInfoText(
        "[data-departure-time]",
        stay.departureTime
      );

      setInfoText(
        "[data-departure-place]",
        stay.departurePlace
      );
    }
  }

  /* =========================================
   MAIN CONTACT
   ========================================= */

const contactArea =
  document.querySelector("#my-contact");

if (contactArea) {
  if (!contact.name) {
    contactArea.style.display = "none";
  } else {
    contactArea.style.display = "";

    const contactName =
      contactArea.querySelector("[data-contact-name]");

    const contactRole =
      contactArea.querySelector("[data-contact-role]");

    const contactAvatar =
      contactArea.querySelector("[data-contact-avatar]");

    const whatsappLink =
      contactArea.querySelector(
        "[data-contact-whatsapp]"
      );

    const callLink =
      contactArea.querySelector(
        "[data-contact-call]"
      );

    const emailLink =
      contactArea.querySelector(
        "[data-contact-email]"
      );


    if (contactName) {
      contactName.textContent =
        contact.name;
    }


    if (contactRole) {
      contactRole.textContent =
        contact.role || "";
    }


    if (contactAvatar) {
      const initials =
        contact.name
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (part) =>
              part.charAt(0)
          )
          .join("")
          .toUpperCase();

      contactAvatar.textContent =
        initials || "M";
    }


    /* PHONE */

    const phone =
      String(
        contact.phone || ""
      ).trim();

    const phoneDigits =
      phone.replace(/\D/g, "");


    /* WHATSAPP */

    if (whatsappLink) {
      if (phoneDigits) {
        whatsappLink.href =
          `https://wa.me/${phoneDigits}`;

        whatsappLink.target =
          "_blank";

        whatsappLink.rel =
          "noopener";

        whatsappLink.style.display =
          "";
      } else {
        whatsappLink.style.display =
          "none";
      }
    }


    /* CALL */

    if (callLink) {
      if (phone) {
        callLink.href =
          `tel:${phone}`;

        callLink.style.display =
          "";
      } else {
        callLink.style.display =
          "none";
      }
    }


    /* EMAIL */

    const email =
      String(
        contact.email || ""
      ).trim();

    if (emailLink) {
      if (email) {
        emailLink.href =
          `mailto:${email}`;

        emailLink.style.display =
          "";
      } else {
        emailLink.style.display =
          "none";
      }
    }
  }
}
}

  /* =========================================
     INFO · SUB PANELS
     ========================================= */

  function initInfoDetailPanels() {
    document
      .querySelectorAll(
        ".info-panel-trigger"
      )
      .forEach(
        (trigger) => {
          if (
            trigger.dataset
              .dynamicActivity ===
            "true"
          ) {
            return;
          }


          if (
            trigger.dataset
              .panelBound ===
            "true"
          ) {
            return;
          }


          trigger.dataset.panelBound =
            "true";


          const activate = () => {
            const panelId =
              trigger.dataset.panel;


            if (!panelId) {
              return;
            }


            openPanel(
              document.getElementById(
                panelId
              )
            );
          };


          trigger.addEventListener(
            "click",
            (event) => {
              event.preventDefault();
              activate();
            }
          );


          trigger.addEventListener(
            "keydown",
            (event) => {
              if (
                event.key ===
                  "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                activate();
              }
            }
          );
        }
      );
  }

     /* =========================================
     MAIN MENU
     ========================================= */

  const currentPage =
    window.location.pathname
      .split("/")
      .pop() ||
    "index.html";


  function buildMainMenu() {
    const menuHTML = `
      <div
        class="main-menu"
        aria-hidden="true"
      >

        <div class="main-menu-inner">

          <div class="main-menu-header">

            <img
              src="logo-mixtur.png"
              alt="Mixtur"
              class="main-menu-logo"
            >

            <button
              class="main-menu-close"
              type="button"
              aria-label="Close menu"
            >
              ×
            </button>

          </div>


          <div class="main-menu-meta">
            Artist Guide · Barcelona
          </div>


          <nav
            class="main-menu-primary"
            aria-label="Main navigation"
          >

            <a
              href="${internalHref(
                "index.html"
              )}"
              data-page="index.html"
            >
              Today
            </a>

            <a
              href="${internalHref(
                "schedule.html"
              )}"
              data-page="schedule.html"
            >
              Schedule
            </a>

            <a
              href="${internalHref(
                "places.html"
              )}"
              data-page="places.html"
            >
              Places
            </a>

            <a
              href="${internalHref(
                "info.html"
              )}"
              data-page="info.html"
            >
              Info
            </a>

          </nav>


          <div class="main-menu-section">

            <div
              class="main-menu-section-label"
            >
              Discover
            </div>


            <button
              class="main-menu-small-link"
              type="button"
              data-editorial="welcome"
            >
              Welcome →
            </button>


            <button
              class="main-menu-small-link"
              type="button"
              data-editorial="mixtur"
            >
              About Mixtur →
            </button>

          </div>


          <div class="main-menu-section">

            <div
              class="main-menu-section-label"
            >
              Quick Access
            </div>


            ${
  artistData?.hotel?.name
    ? `
      <a
        class="main-menu-small-link"
        href="${internalHref(
          "places.html",
          "#my-hotel"
        )}"
      >
        My Hotel →
      </a>
    `
    : ""
}


            <a
              class="main-menu-small-link"
              href="${internalHref(
                "info.html",
                "#my-contact"
              )}"
            >
              My Contact →
            </a>


            <a
              class="main-menu-small-link"
              href="${internalHref(
                "info.html",
                "#getting-around"
              )}"
            >
              Getting Around →
            </a>

          </div>


          <div class="main-menu-footer">

            <a
              href="https://mixturbcn.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mixtur Festival ↗
            </a>

          </div>

        </div>

      </div>
    `;


    document.body
      .insertAdjacentHTML(
        "beforeend",
        menuHTML
      );


    const mainMenu =
      document.querySelector(
        ".main-menu"
      );


    const menuButtons =
      document.querySelectorAll(
        ".menu-button"
      );


    const menuClose =
      document.querySelector(
        ".main-menu-close"
      );


    const menuLinks =
      document.querySelectorAll(
        ".main-menu-primary a"
      );


    menuLinks.forEach(
      (link) => {
        if (
          link.dataset.page ===
          currentPage
        ) {
          link.classList.add(
            "active"
          );
        }
      }
    );


    function openMenu() {
      if (!mainMenu) {
        return;
      }


      mainMenu.classList.add(
        "open"
      );


      mainMenu.setAttribute(
        "aria-hidden",
        "false"
      );


      document.body
        .classList.add(
          "menu-open"
        );
    }


    function closeMenu() {
      if (!mainMenu) {
        return;
      }


      mainMenu.classList.remove(
        "open"
      );


      mainMenu.setAttribute(
        "aria-hidden",
        "true"
      );


      document.body
        .classList.remove(
          "menu-open"
        );
    }


    menuButtons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          openMenu
        );
      }
    );


    menuClose?.addEventListener(
      "click",
      closeMenu
    );


    return {
      mainMenu,
      openMenu,
      closeMenu
    };
  }


  /* =========================================
     EDITORIAL PANELS
     ========================================= */

  function buildEditorialPanel(
    menuAPI
  ) {
    const editorialHTML = `
      <div
        class="editorial-panel"
        aria-hidden="true"
      >

        <div
          class="editorial-panel-inner"
        >

          <div
            class="editorial-panel-header"
          >

            <button
              class="editorial-back"
              type="button"
            >
              ← Back
            </button>


            <button
              class="editorial-close"
              type="button"
              aria-label="Close"
            >
              ×
            </button>

          </div>


          <div
            class="editorial-content"
            data-editorial-content="welcome"
          >

            <div
              class="editorial-label"
            >
              Welcome
            </div>


            <h1
              class="editorial-title"
            >
              Welcome<br>
              to Mixtur
            </h1>


            <p
              class="editorial-lead"
            >
              We are very happy to welcome
              you to Barcelona for Mixtur.
            </p>


            <div
              class="editorial-copy"
            >

              <p>
                This Artist Guide has been
                prepared to accompany you
                throughout your stay and
                bring together everything
                you may need during the
                festival: your schedule,
                venues, travel information
                and the people you may need
                to contact.
              </p>


              <p>
                We hope you enjoy the
                festival, the music, the
                encounters and your time
                in Barcelona.
              </p>

            </div>


            <div
              class="editorial-signature"
            >
              — Mixtur
            </div>

          </div>


          <div
            class="editorial-content"
            data-editorial-content="mixtur"
            hidden
          >

            <div
              class="editorial-label"
            >
              About Mixtur
            </div>


            <h1
              class="editorial-title"
            >
              New creation<br>
              at the centre
            </h1>


            <p
              class="editorial-lead"
            >
              Mixtur is a festival for
              contemporary sound creation
              based in Barcelona.
            </p>


            <div
              class="editorial-copy"
            >

              <p>
                At its core is
                <strong>
                  new creation
                </strong>:
                bringing composers,
                performers and artists
                together to develop,
                explore and present
                new work.
              </p>


              <p>
                Through concerts,
                commissions, workshops,
                calls for scores and
                educational projects,
                Mixtur creates a space
                for experimentation,
                exchange and discovery
                between emerging and
                established artists.
              </p>


              <p>
                More than a festival,
                Mixtur is a meeting point
                for the international
                contemporary music
                community.
              </p>

            </div>


            <div
              class="editorial-keywords"
            >

              <span>
                Creation
              </span>

              <span>
                Experimentation
              </span>

              <span>
                Exchange
              </span>

            </div>


            <a
              class="editorial-web-link"
              href="https://mixturbcn.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Mixtur Festival ↗
            </a>

          </div>

        </div>

      </div>
    `;


    document.body
      .insertAdjacentHTML(
        "beforeend",
        editorialHTML
      );


    const editorialPanel =
      document.querySelector(
        ".editorial-panel"
      );


    const editorialContents =
      document.querySelectorAll(
        "[data-editorial-content]"
      );


    const editorialBack =
      document.querySelector(
        ".editorial-back"
      );


    const editorialClose =
      document.querySelector(
        ".editorial-close"
      );


    function openEditorial(
      name
    ) {
      if (!editorialPanel) {
        return;
      }


      editorialContents.forEach(
        (content) => {
          content.hidden =
            content.dataset
              .editorialContent !==
            name;
        }
      );


      menuAPI.closeMenu();


      editorialPanel
        .classList.add(
          "open"
        );


      editorialPanel
        .setAttribute(
          "aria-hidden",
          "false"
        );


      document.body
        .classList.add(
          "editorial-open"
        );


      editorialPanel.scrollTop =
        0;
    }


    function closeEditorial() {
      if (!editorialPanel) {
        return;
      }


      editorialPanel
        .classList.remove(
          "open"
        );


      editorialPanel
        .setAttribute(
          "aria-hidden",
          "true"
        );


      document.body
        .classList.remove(
          "editorial-open"
        );
    }


    document.addEventListener(
      "click",
      (event) => {

        const trigger =
          event.target.closest(
            "[data-editorial]"
          );


        if (!trigger) {
          return;
        }


        openEditorial(
          trigger.dataset.editorial
        );
      }
    );


    editorialBack
      ?.addEventListener(
        "click",
        () => {
          closeEditorial();
          menuAPI.openMenu();
        }
      );


    editorialClose
      ?.addEventListener(
        "click",
        closeEditorial
      );


    return {
      editorialPanel,
      closeEditorial
    };
  }


  /* =========================================
     QUICK ACCESS
     ========================================= */

  function openInfoSection(
    section
  ) {
    if (!section) {
      return;
    }


    const infoSections =
      document.querySelectorAll(
        ".info-section"
      );


    infoSections.forEach(
      (item) => {
        item.classList.remove(
          "open"
        );


        const button =
          item.querySelector(
            ".info-toggle, .info-section-toggle"
          );


        button?.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    );


    section.classList.add(
      "open"
    );


    const button =
      section.querySelector(
        ".info-toggle, .info-section-toggle"
      );


    button?.setAttribute(
      "aria-expanded",
      "true"
    );


    setTimeout(
      () => {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      },
      120
    );
  }


  function handleQuickAccess() {
    const hash =
      window.location.hash;


    if (
      currentPage ===
        "places.html" &&
      hash === "#my-hotel"
    ) {
      const hotel =
        document.querySelector(
          "#my-hotel"
        ) ||
        document.querySelector(
          "[data-artist-hotel]"
        ) ||
        document.querySelector(
          ".featured-place"
        );


      if (hotel) {
        setTimeout(
          () => {
            hotel.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          },
          120
        );
      }
    }


    if (
      currentPage ===
        "info.html" &&
      hash === "#my-contact"
    ) {
      const contactSection =
        document.querySelector(
          "#my-contact"
        );


      if (
        contactSection?.classList
          .contains(
            "info-section"
          )
      ) {
        openInfoSection(
          contactSection
        );

        return;
      }


      const sections =
        document.querySelectorAll(
          ".info-section"
        );


      if (sections[2]) {
        openInfoSection(
          sections[2]
        );
      }
    }


    if (
      currentPage ===
        "info.html" &&
      hash ===
        "#getting-around"
    ) {
      const gettingAround =
        document.querySelector(
          "#getting-around"
        );


      if (
        gettingAround?.classList
          .contains(
            "info-section"
          )
      ) {
        openInfoSection(
          gettingAround
        );

        return;
      }


      const sections =
        document.querySelectorAll(
          ".info-section"
        );


      if (sections[0]) {
        openInfoSection(
          sections[0]
        );
      }
    }
  }


  /* =========================================
     BOTTOM NAV
     KEEP ARTIST PARAMETER
     ========================================= */

  function repairBottomNavigation() {
    document
      .querySelectorAll(
        ".bottom-nav a, nav a"
      )
      .forEach(
        (link) => {

          const href =
            link.getAttribute(
              "href"
            );


          if (!href) {
            return;
          }


          const match =
            href.match(
              /^(index\.html|schedule\.html|places\.html|info\.html)(#[^?]*)?$/
            );


          if (!match) {
            return;
          }


          link.setAttribute(
            "href",
            internalHref(
              match[1],
              match[2] || ""
            )
          );
        }
      );
  }


  /* =========================================
     FALLBACK MAP LINKS
     ========================================= */

  function repairGenericMapLinks() {
    document
      .querySelectorAll(
        'a[href="#"]'
      )
      .forEach(
        (link) => {

          const text =
            normalizeText(
              link.textContent
            );


          if (
            !text.includes(
              "maps"
            )
          ) {
            return;
          }


          const card =
            link.closest(
              ".featured-place, .place-card, .place-panel"
            );


          if (!card) {
            return;
          }


          const title =
            card.querySelector(
              "h2, h3, .place-title, .panel-title"
            )
              ?.textContent
              ?.trim();


          if (!title) {
            return;
          }


          const venue =
            Object.keys(
              venueData
            ).find(
              (name) =>
                normalizeText(
                  title
                ).includes(
                  normalizeText(
                    name
                  )
                )
            );


          if (venue) {
            link.href =
              venueData[
                venue
              ].maps;

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";

            return;
          }


          if (
            artistData
              ?.hotel
              ?.name &&
            normalizeText(
              title
            ).includes(
              normalizeText(
                artistData
                  .hotel
                  .name
              )
            )
          ) {
            link.href =
              "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent(
                artistData.hotel
                  .address ||
                artistData.hotel
                  .name
              );

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";
          }
        }
      );
  }


  /* =========================================
     ESCAPE KEY
     ========================================= */

  function initEscapeKey(
    menuAPI,
    editorialAPI
  ) {
    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key !==
          "Escape"
        ) {
          return;
        }


        let panelWasOpen =
          false;


        document
          .querySelectorAll(
            ".place-panel.open"
          )
          .forEach(
            (panel) => {
              panelWasOpen =
                true;

              closePanel(
                panel
              );
            }
          );


        if (panelWasOpen) {
          return;
        }


        if (
          editorialAPI
            .editorialPanel
            ?.classList
            .contains(
              "open"
            )
        ) {
          editorialAPI
            .closeEditorial();

          return;
        }


        if (
          menuAPI
            .mainMenu
            ?.classList
            .contains(
              "open"
            )
        ) {
          menuAPI.closeMenu();
        }
      }
    );
  }


  /* =========================================
     INITIALISE
     ========================================= */

  artistData =
    await loadArtistData();


  const menuAPI =
    buildMainMenu();


  const editorialAPI =
    buildEditorialPanel(
      menuAPI
    );


  initDynamicActivityDelegation();


  if (
    currentPage ===
      "index.html" ||
    currentPage === ""
  ) {
    renderTodayPage();
  }


  if (
    currentPage ===
    "schedule.html"
  ) {
    renderSchedulePage();
  }


  if (
  currentPage ===
  "places.html"
) {
  renderVenueDataInPlaces();

  renderArtistHotelInPlaces();

  initPlacesFilters();

  repairPlacesMapLinks();
}
   

  if (
    currentPage ===
    "info.html"
  ) {
    initInfoAccordion();

    renderInfoArtistData();
  }


  initStaticPanels();

  initInfoDetailPanels();

  repairGenericMapLinks();

  preserveArtistInNavigation();

  repairBottomNavigation();

  handleQuickAccess();

  initEscapeKey(
    menuAPI,
    editorialAPI
  );


  /* =========================================
     READY
     ========================================= */

  console.log(
  "Mixtur Artist Guide ready.",
  {
    page:
      currentPage,
    artist:
      artistId ||
      null
  }
);


});

                          
