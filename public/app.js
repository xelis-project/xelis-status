(function () {
  "use strict";

  // Official seed nodes. Kept as plain data so no framework is required.
  var NODES = [
    {
      location: "US #1",
      endpoint: "https://us-node.xelis.io",
      wsEndpoint: "wss://us-node.xelis.io/json_rpc",
      flag: "us",
    },
    {
      location: "France #1",
      endpoint: "https://fr-node.xelis.io",
      wsEndpoint: "wss://fr-node.xelis.io/json_rpc",
      flag: "fr",
    },
  ];

  var POLL_MS = 5000;
  var TIMEOUT_MS = 9000;

  var FLAGS = {
    us: usFlag(),
    fr: frFlag(),
  };

  function usFlag() {
    var red = "";
    for (var i = 0; i < 13; i += 2) {
      red += '<rect x="0" y="' + (i * (40 / 13)).toFixed(3) + '" width="60" height="' + (40 / 13).toFixed(3) + '" fill="#b22234"/>';
    }
    var stars = "";
    for (var row = 0; row < 5; row++) {
      for (var col = 0; col < 6; col++) {
        var cx = 2.2 + col * 3.9 + (row % 2 ? 1.95 : 0);
        var cy = 2.4 + row * 4.2;
        stars += '<circle cx="' + cx.toFixed(2) + '" cy="' + cy.toFixed(2) + '" r="0.62" fill="#fff"/>';
      }
    }
    return '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="60" height="40" fill="#fff"/>' + red +
      '<rect width="24" height="' + (40 / 13 * 7).toFixed(3) + '" fill="#3c3b6e"/>' +
      stars + "</svg>";
  }

  function frFlag() {
    return '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="20" height="40" fill="#002395"/>' +
      '<rect x="20" width="20" height="40" fill="#fff"/>' +
      '<rect x="40" width="20" height="40" fill="#ed2939"/></svg>';
  }

  function cardHTML(node, index) {
    return '<article class="node-card" data-state="init" data-index="' + index + '" aria-busy="true">' +
      '<div class="node-top">' +
        '<div class="node-id">' +
          '<span class="flag">' + (FLAGS[node.flag] || "") + "</span>" +
          '<div>' +
            "<h3>" + esc(node.location) + "</h3>" +
            '<a class="endpoint" href="' + esc(node.endpoint) + '" target="_blank" rel="noopener">' + esc(node.endpoint) + "</a>" +
          "</div>" +
        "</div>" +
        '<div class="node-latency">' +
          '<span class="latency-value">—</span>' +
          '<span class="node-dot" aria-hidden="true"></span>' +
        "</div>" +
      "</div>" +
      '<div class="node-stats">' +
        stat("Top Block", "top_block_hash", "hash wide") +
        stat("Height", "height") +
        stat("Stable Height", "stableheight") +
        stat("Topo Height", "topoheight") +
        stat("Version", "version", "dim") +
        stat("Network", "network", "dim") +
        stat("Difficulty", "difficulty", "dim") +
      "</div>" +
      '<div class="node-error" hidden></div>' +
    "</article>";
  }

  function stat(label, field, cls) {
    return '<div class="stat">' +
      '<span class="label">' + label + "</span>" +
      '<span class="value' + (cls ? " " + cls : "") + '" data-field="' + field + '">—</span>' +
    "</div>";
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function fmt(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : "—";
  }

  var grid = document.getElementById("node-grid");
  var cards = [];
  var nodesState = [];
  var running = false;

  function init() {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
    if (!grid) return;

    grid.innerHTML = NODES.map(cardHTML).join("");
    cards = NODES.map(function (_, i) {
      return grid.querySelector('[data-index="' + i + '"]');
    });

    poll();
    window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) poll();
    });
  }

  function poll() {
    if (running || document.hidden) return;
    running = true;
    Promise.all(NODES.map(function (node, index) {
      return check(node).then(function (result) {
        render(index, result);
      });
    })).then(function () {
      running = false;
      updateOverall();
    });
  }

  function check(node) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var started = performance.now();

    return fetch(node.endpoint + "/json_rpc", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "get_info" }),
      signal: controller.signal,
      cache: "no-store",
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (json) {
      if (json && json.error) throw new Error(json.error.message || "RPC error");
      return { ok: true, elapsed: Math.round(performance.now() - started), info: (json && json.result) || {} };
    }).catch(function (err) {
      var message = err && err.name === "AbortError"
        ? "Request timed out"
        : (err && err.message) || String(err);
      return { ok: false, error: message };
    }).then(function (result) {
      window.clearTimeout(timer);
      return result;
    });
  }

  function render(index, result) {
    var card = cards[index];
    if (!card) return;
    card.setAttribute("aria-busy", "false");

    var latency = card.querySelector(".latency-value");
    var errorEl = card.querySelector(".node-error");

    if (!result.ok) {
      card.dataset.state = "dead";
      if (latency) latency.textContent = "offline";
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = result.error;
      }
      nodesState[index] = "dead";
      return;
    }

    var elapsed = result.elapsed;
    card.dataset.state = elapsed > 200 ? "slower" : elapsed > 100 ? "slow" : "best";
    if (latency) latency.textContent = fmt(elapsed) + " ms";
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    var info = result.info || {};
    setField(card, "top_block_hash", info.top_block_hash);
    setField(card, "height", fmt(info.height));
    setField(card, "stableheight", fmt(info.stableheight));
    setField(card, "topoheight", fmt(info.topoheight));
    setField(card, "version", info.version || "—");
    setField(card, "network", info.network || "—");
    setField(card, "difficulty", info.difficulty != null ? String(info.difficulty) : "—");

    nodesState[index] = "live";
  }

  function setField(card, field, value) {
    var el = card.querySelector('[data-field="' + field + '"]');
    if (el) el.textContent = value == null || value === "" ? "—" : String(value);
  }

  function updateOverall() {
    var live = 0;
    var dead = 0;
    for (var i = 0; i < NODES.length; i++) {
      if (nodesState[i] === "live") live++;
      else if (nodesState[i] === "dead") dead++;
    }

    var total = NODES.length;
    var state = "waiting";
    var label = "Checking nodes";
    var netLabel = "connecting";
    var netClass = "connecting";

    if (live === total) {
      state = "online";
      label = "All nodes are fully operational";
      netLabel = "online";
      netClass = "";
    } else if (dead === total) {
      state = "offline";
      label = "All nodes are offline";
      netLabel = "offline";
      netClass = "offline";
    } else if (live + dead === total) {
      state = "degraded";
      label = "A few nodes are currently down (" + dead + ")";
      netLabel = "degraded";
      netClass = "degraded";
    }

    var overall = document.getElementById("overall");
    if (overall) overall.dataset.state = state;
    var overallLabel = document.getElementById("overall-label");
    if (overallLabel) overallLabel.textContent = label;

    var net = document.getElementById("net-status");
    if (net) net.className = "status " + netClass;
    var netLabelEl = document.getElementById("net-label");
    if (netLabelEl) netLabelEl.textContent = netLabel;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
