document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-toggle');
    const menuText = document.querySelector('.menu-text'); // <--- Catturiamo il testo del bottone
    const sideNav = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        menuBtn.classList.toggle('active');
        sideNav.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Controlla se il menù è aperto o chiuso
        if (sideNav.classList.contains('open')) {
            document.body.style.overflow = 'hidden'; // Blocca lo scorrimento
            menuText.textContent = 'CHIUDI';          // <--- Cambia la scritta in CLOSE
        } else {
            document.body.style.overflow = '';       // Riattiva lo scorrimento
            menuText.textContent = 'MENÙ';           // <--- Fa tornare la scritta MENÙ
        }
    }

    // Apri/Chiudi dal bottone Header
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);

    // Chiudi cliccando fuori (sullo sfondo scuro)
    if (overlay) overlay.addEventListener('click', toggleMenu);
});

// --- ANIMAZIONE FADE-IN ALLO SCROLL ---
    // Usiamo IntersectionObserver per capire quando un elemento entra nello schermo
    const faders = document.querySelectorAll('.fade-on-scroll');

    const appearOptions = {
        threshold: 0.15, // L'animazione parte quando il 15% dell'elemento è visibile
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('is-visible');
                appearOnScroll.unobserve(entry.target); // Ferma l'osservazione una volta apparso
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });


    document.addEventListener('DOMContentLoaded', () => {
    // --- GESTIONE MENU E FADE-IN (già esistenti) ---
    // ... (mantieni il codice del menu e dell'IntersectionObserver) ...

    // --- LOGICA SPARQL MULTI-QUERY ---
    const sparqlButtons = document.querySelectorAll('.sparql-btn');

    const queries = {
        "1": `PREFIX wd: <http://www.wikidata.org/entity/> 
              PREFIX wdt: <http://www.wikidata.org/prop/direct/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              SELECT DISTINCT ?film ?label WHERE {
                ?film wdt:P31 wd:Q11424 ; rdfs:label ?label .
                FILTER(REGEX(?label, "Barry Lyndon", "i"))
              } LIMIT 10`,
        "2": `PREFIX wd: <http://www.wikidata.org/entity/> 
              PREFIX wdt: <http://www.wikidata.org/prop/direct/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              SELECT DISTINCT ?film ?label ?registaLabel ?dataPubblicazione WHERE {
                BIND(wd:Q471716 AS ?film) 
                ?film rdfs:label ?label . FILTER(LANG(?label) = "en")
                OPTIONAL { ?film wdt:P57 ?regista . ?regista rdfs:label ?registaLabel . FILTER(LANG(?registaLabel) = "en") }
                OPTIONAL { ?film wdt:P577 ?dataPubblicazione . }
              } ORDER BY ?dataPubblicazione`,
        "3a": `PREFIX wd: <http://www.wikidata.org/entity/>
               PREFIX wdt: <http://www.wikidata.org/prop/direct/>
               PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
               SELECT DISTINCT ?stato ?premioLabel WHERE {
                 VALUES (?proprieta ?stato) {
                   (wdt:P166  "Vinto")
                   (wdt:P1411 "Nomination")
                 }
                 wd:Q471716 ?proprieta ?premio .
                 ?premio rdfs:label ?premioLabel . FILTER(LANG(?premioLabel) = "en")
               } ORDER BY ?stato`,
               
        "3b": `PREFIX wd: <http://www.wikidata.org/entity/>
               PREFIX wdt: <http://www.wikidata.org/prop/direct/>
               PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
               SELECT DISTINCT ?stato ?premioLabel WHERE {
                 { wd:Q471716 wdt:P166 ?premio . }
                 UNION
                 { wd:Q471716 wdt:P1411 ?premio . }
                 ?premio rdfs:label ?premioLabel . FILTER(LANG(?premioLabel) = "en")
               } ORDER BY ?stato`,
               
        "3c": `PREFIX wd: <http://www.wikidata.org/entity/>
               PREFIX wdt: <http://www.wikidata.org/prop/direct/>
               PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
               SELECT ?premioLabel (SAMPLE(?stato) AS ?statoUnivoco) WHERE {
                 { wd:Q471716 wdt:P166 ?premio . wd:Q471716 wdt:P166 ?checkVinto . }
                 UNION
                 { wd:Q471716 wdt:P1411 ?premio . wd:Q471716 wdt:P1411 ?checkNomination . }
                 BIND(IF(BOUND(?checkVinto), "Vinto", IF(BOUND(?checkNomination), "Nomination", "Sconosciuto")) AS ?stato)
                 ?premio rdfs:label ?premioLabel . FILTER(LANG(?premioLabel) = "en")
               } GROUP BY ?premioLabel ORDER BY ?statoUnivoco ?premioLabel`,
        "4": `PREFIX wd: <http://www.wikidata.org/entity/> 
              PREFIX wdt: <http://www.wikidata.org/prop/direct/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX wikibase: <http://wikiba.se/ontology#>
              SELECT ?propLabel ?descrizioneProp (SAMPLE(?valoreLabel) AS ?esempio) WHERE {
                wd:Q471716 ?p ?valore .
                ?prop wikibase:directClaim ?p .
                ?prop rdfs:label ?propLabel . FILTER(LANG(?propLabel) = "en")
                OPTIONAL { ?prop schema:description ?descrizioneProp . FILTER(LANG(?descrizioneProp) = "en") }
                OPTIONAL { ?valore rdfs:label ?valoreLabel . FILTER(LANG(?valoreLabel) = "en") }
                FILTER(!REGEX(?propLabel, "ID|identifier|identificativo", "i"))
              } GROUP BY ?propLabel ?descrizioneProp ORDER BY ?propLabel`,
        "lacuna1": `SELECT DISTINCT ?proprieta ?entitaMusicale ?label WHERE {
                      wd:Q471716 wdt:P942 ?entitaMusicale . 
                      ?entitaMusicale rdfs:label ?label . FILTER(LANG(?label) = "en")
                    } ORDER BY ?label`,
                    
        "lacuna2": `PREFIX wd: <http://www.wikidata.org/entity/>
                    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT DISTINCT ?proprietaLabel ?collegamentoLabel WHERE {
                      VALUES ?prop { wdt:P941 wdt:P737 wdt:P180 }
                      wd:Q471716 ?prop ?collegamento .
                      ?prop rdfs:label ?proprietaLabel .
                      ?collegamento rdfs:label ?collegamentoLabel .
                      FILTER(LANG(?proprietaLabel) = "en")
                      FILTER(LANG(?collegamentoLabel) = "en")
                    }`,
        "lacuna2ask": `PREFIX wd: <http://www.wikidata.org/entity/>
                       PREFIX wdt: <http://www.wikidata.org/prop/direct/>
                       PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                       ASK WHERE {
                         VALUES ?prop { wdt:P941 wdt:P737 wdt:P180 }
                         wd:Q471716 ?prop ?collegamento .
                       }`,
                    
        "lacuna3": `PREFIX wd: <http://www.wikidata.org/entity/>
                    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT ?prop ?propLabel ?valoreLabel WHERE {
                      wd:Q471716 ?p ?valore .
                      ?prop wikibase:directClaim ?p .
                      ?prop rdfs:label ?propLabel . FILTER(LANG(?propLabel) = "en")
                      FILTER(REGEX(?propLabel, "lens|camera|optical|technique|method|aspect", "i"))
                      OPTIONAL { ?valore rdfs:label ?valoreLabel . FILTER(LANG(?valoreLabel) = "en") }
                    }`,
        "miglioria1a": `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

CONSTRUCT {
  wd:Q471716 wdt:P942 ?brano .
}
WHERE {
  VALUES ?brano {
    wd:Q1660217    
    wd:Q124151832  
    wd:Q11915173   
    wd:Q723559     
    wd:Q127058368  
    wd:Q1434350    
    wd:Q7423184    
  }
}`,

        "miglioria1b": `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ex: <http://example.org/barrylyndon/soundtrack/>

CONSTRUCT {
  wd:Q471716 wdt:P942 ?idBrano .
  ?idBrano rdfs:label ?titoloBrano .
  ?idBrano rdfs:seeAlso ?linkEsterno .
}
WHERE {
  VALUES (?idBrano ?titoloBrano ?linkEsterno) {
    (ex:schubertGermanDanceNo1 "German Dance No.1 in C major (Schubert)"@en  <https://en.wikipedia.org/wiki/List_of_compositions_by_Franz_Schubert>)
    (ex:hohenfriedbergerMarch  "Hohenfriedberger March (Frederick the Great)"@en <https://en.wikipedia.org/wiki/Hohenfriedberger_Marsch>)
    (ex:womenOfIreland         "Women of Ireland / Tin Whistles (Seán Ó Riada)"@en <https://tin-whistle.music-tabs.com/music-sheet/women_of_ireland_sean_o_riada>)
    (ex:theSeaMaiden           "The Sea Maiden (The Chieftains)"@en          <https://www.tunefind.com/song/the-chieftains/the-sea-maiden>)
  }
}`,

        "miglioria2a": `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?prop ?propLabel ?desc
WHERE {
  ?prop a wikibase:Property .
  ?prop rdfs:label ?propLabel .
  ?prop schema:description ?desc .
  
  FILTER(REGEX(?propLabel, "inspired|painting|artistic|depicts", "i"))
  FILTER(LANG(?propLabel) = "en")
  FILTER(LANG(?desc) = "en")
}
LIMIT 50`,

        "miglioria2b": `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?filmLabel ?quadroLabel
WHERE {
  ?film wdt:P31 wd:Q11424 .     
  ?film wdt:P941 ?quadro .       
  ?quadro wdt:P31 wd:Q3305213 . 
  ?film rdfs:label ?filmLabel .
  ?quadro rdfs:label ?quadroLabel .
  FILTER(LANG(?filmLabel) = "en")
  FILTER(LANG(?quadroLabel) = "en")
}
LIMIT 20`,

        "miglioria2c": `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

CONSTRUCT {
  wd:Q471716 wdt:P941 ?quadro .
}
WHERE {
  VALUES ?quadro {
    wd:Q604761    
    wd:Q3451328   
    wd:Q5220868   
    wd:Q66970124  
    wd:Q18937352  
  }
}`,

        "miglioria3a": `PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
PREFIX p: <http://www.wikidata.org/prop/>

SELECT DISTINCT ?property ?propertyLabel ?description
WHERE {
  ?property a wikibase:Property .
  ?property rdfs:label ?propertyLabel .
  ?property schema:description ?description .
  FILTER(REGEX(?propertyLabel, "camera|lens", "i") || REGEX(?description, "camera|lens", "i"))
  FILTER(REGEX(?description, "film|movie|cinema|motion picture", "i"))
  FILTER(LANG(?propertyLabel) = "en")
  FILTER(LANG(?description) = "en")
}
ORDER BY ?propertyLabel`,

        "miglioria3b": `PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX ex: <http://example.org/ontologyprogetto/estensione/>

CONSTRUCT {
  ex:cinematographicLensUsed a rdf:Property ;
                             rdfs:label "cinematographic lens used"@en ;
                             rdfs:comment "The specific lens model used to achieve the visual style of a motion picture."@en ;
                             rdfs:domain wd:Q11424 ;      
                             rdfs:range wd:Q109672300 .   
  wd:Q471716 ex:cinematographicLensUsed wd:Q4035883 .
}
WHERE {
  VALUES ?film { wd:Q471716 }
}`
    };

    sparqlButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const queryId = btn.getAttribute('data-query-id');
            const resultBox = document.getElementById(`results-${queryId}`);
            const queryText = queries[queryId];

            resultBox.innerHTML = '<p class="results-placeholder">Interrogazione in corso...</p>';

            const url = 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(queryText);

            fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } })
                .then(res => res.json())
                .then(data => {
                    // CONTROLLO PER LE QUERY 'ASK' (Risultato Booleano)
                    if (data.boolean !== undefined) {
                        const isTrue = data.boolean;
                        // Stile grafico gigante per il Vero o Falso
                        resultBox.innerHTML = `
                            <div style="text-align: center; width: 100%;">
                                <span style="font-size: 0.75rem; letter-spacing: 2px; color: #888; display: block; margin-bottom: 5px;">RISULTATO DELLA QUERY</span>
                                <span style="font-size: 3.5rem; font-weight: 500; letter-spacing: -2px; line-height: 1; color: #000;">
                                    ${isTrue ? 'TRUE' : 'FALSE'}
                                </span>
                            </div>
                        `;
                        return; // Ferma lo script qui per le query ASK
                    }

                    // ... (Il resto del codice originale per le tabelle SELECT rimane uguale) ...
                    const bindings = data.results.bindings;
                    if (bindings.length === 0) {
                        resultBox.innerHTML = '<p class="results-placeholder">Nessun risultato.</p>';
                        return;
                    }

                    let html = '<table class="sparql-table"><thead><tr>';
                    data.head.vars.forEach(v => html += `<th>${v}</th>`);
                    html += '</tr></thead><tbody>';

                    bindings.forEach(row => {
                        html += '<tr>';
                        data.head.vars.forEach(v => {
                            let val = row[v] ? row[v].value : '-';
                            if (val.includes('entity/')) val = 'wd:' + val.split('/').pop();
                            html += `<td>${val}</td>`;
                        });
                        html += '</tr>';
                    });
                    html += '</tbody></table>';
                    resultBox.innerHTML = html;
                })
                .catch(err => {
                    resultBox.innerHTML = '<p class="results-placeholder" style="color:red">Errore di connessione o sintassi.</p>';
                });
        });
    });
});

// --- SCRIPT PER L'APERTURA INTERATTIVA DEI PANNELLI DI CONFRONTO LLM ---
document.addEventListener('DOMContentLoaded', () => {
    const comparisonButtons = document.querySelectorAll('.toggle-comparison-btn');

    comparisonButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const panel = document.getElementById(targetId);

            if (panel) {
                // Se il pannello è nascosto, lo mostriamo; altrimenti lo nascondiamo
                if (panel.style.display === 'block') {
                    panel.style.display = 'none';
                    btn.textContent = 'MOSTRA CONFRONTO CHATGPT VS GEMINI ⇆';
                    btn.style.backgroundColor = '#000000';
                    btn.style.color = '#ffffff';
                } else {
                    panel.style.display = 'block';
                    btn.textContent = 'NASCONDI CONFRONTO INTERNO ✕';
                    btn.style.backgroundColor = '#ffffff';
                    btn.style.color = '#000000';
                }
            }
        });
    });
});

// --- SCRIPT PER I TAB DEI CONFRONTI LLM (GEMINI VS CHATGPT) ---
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.chat-toggle-btn');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Ottiene l'identificativo del gruppo (es. "q2")
            const groupName = btn.getAttribute('data-group');
            const targetId = btn.getAttribute('data-target');

            // 1. Deseleziona tutti i bottoni di questo gruppo e attiva quello cliccato
            const groupButtons = document.querySelectorAll(`.chat-toggle-btn[data-group="${groupName}"]`);
            groupButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Nasconde tutte le chat (view) di questo gruppo
            const groupViews = document.querySelectorAll(`.chat-view-group.${groupName}`);
            groupViews.forEach(view => {
                view.classList.remove('active-view');
                view.style.display = 'none';
            });

            // 3. Mostra solo la chat selezionata
            const activeView = document.getElementById(targetId);
            if (activeView) {
                activeView.classList.add('active-view');
                activeView.style.display = 'flex';
            }
        });
    });
});