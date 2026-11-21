/* Disease breakdowns.
   Every entry is a research-stage CONCEPT written for discussion. Nothing here is a
   treatment, nothing is FDA approved, and the specific approach described has not been tested in humans.
   Have a qualified scientist review each entry before it is relied on. */
window.DISEASES = [
  {
    id: "alzheimers",
    name: "Alzheimer's disease",
    category: "Neurodegeneration",
    blurb: "Progressive loss of memory and thinking. Plaques, tangles, and a brain immune system that can't keep up.",
    overview: "Alzheimer's is the most common cause of dementia. Neurons in memory-related regions slowly lose their connections and then die, usually over a decade or more. Two antibody drugs that clear amyloid have been approved, but they slow decline only modestly and do not stop the disease.",
    problem: [
      "Amyloid-beta builds up outside neurons as plaques, years before symptoms begin.",
      "Tau protein becomes abnormal inside neurons and spreads from cell to cell along connected brain regions. Tau spread tracks closely with cognitive decline.",
      "Microglia, the brain's resident immune cells, become chronically inflamed and less able to clear debris."
    ],
    ideaTitle: "Intercept spreading tau, and restore the brain's cleanup crew",
    idea: "Amyloid removal alone arrives late, after tau has begun to spread. Our concept pairs two parts: an antibody that binds the 'seeds' of abnormal tau between cells, carried across the blood-brain barrier on a transferrin-receptor shuttle, and a second agent that nudges microglia back toward a debris-clearing state.",
    steps: [
      "Engineer an antibody fragment that recognises misfolded tau seeds but ignores normal tau.",
      "Attach a transferrin-receptor binding arm so more of the dose reaches the brain than a standard antibody does.",
      "Combine with a microglia-modulating compound so seeds that are bound get cleared rather than just sitting there.",
      "Give early, in people with biomarker evidence of tau but little symptom burden."
    ],
    evidence: "In mouse models, antibodies against tau seeds reduce spread between brain regions, and brain-shuttle antibodies reach much higher brain levels than standard ones. Microglia-targeting drugs have had mixed results in people, which is one reason the combination is a hypothesis and not a plan.",
    unknowns: [
      "Whether blocking extracellular tau spread helps once tau pathology is already established inside cells.",
      "Whether pushing microglia into a more active state is safe over years.",
      "Brain swelling and bleeding, which have been real risks for amyloid antibodies, may apply here too."
    ],
    path: [
      "Show seed-specificity in human brain tissue samples.",
      "Test the pair in at least two mouse models and one larger animal for safety.",
      "Manufacture to clinical grade and file an Investigational New Drug application.",
      "Phase 1 safety trial, then Phase 2 and 3 efficacy trials, then FDA review."
    ]
  },
  {
    id: "parkinsons",
    name: "Parkinson's disease",
    category: "Neurodegeneration",
    blurb: "Tremor, stiffness, and slowness caused by the loss of dopamine-producing neurons.",
    overview: "Parkinson's affects movement because a small cluster of neurons in the midbrain, which make dopamine, die off. Current drugs replace dopamine and help symptoms for years, but the underlying loss continues.",
    problem: [
      "Dopamine neurons in the substantia nigra degrade, and by diagnosis a large share are already gone.",
      "Misfolded alpha-synuclein clumps into Lewy bodies and appears to spread between cells.",
      "Mitochondria and the lysosomal clearance system in these neurons are under heavy stress, and genes such as LRRK2 and GBA1 are tied to both."
    ],
    ideaTitle: "Replace the lost neurons with grafts built to resist the disease",
    idea: "Transplanted dopamine neurons have been grafted into patients before, and some of those grafts later showed signs of the same pathology. Our concept grafts lab-grown dopamine neuron precursors that have had alpha-synuclein production dialled down, so the new cells are poor hosts for the misfolded protein.",
    steps: [
      "Start from a stem-cell line and differentiate it into midbrain dopamine neuron precursors.",
      "Use CRISPR interference to reduce SNCA (the alpha-synuclein gene) without cutting the DNA.",
      "Screen out any cells with off-target changes or tumour-forming potential.",
      "Inject the precursors into the putamen, where dopamine release matters most for movement."
    ],
    evidence: "Stem-cell-derived dopamine neurons restore movement in rodent and primate models. Reducing alpha-synuclein is protective in several animal studies, though complete removal has had its own downsides, which is why partial reduction is proposed.",
    unknowns: [
      "How much alpha-synuclein reduction is helpful and how much is harmful.",
      "Whether grafts will wire into circuits correctly and survive for decades.",
      "Whether surgery and immune suppression are an acceptable burden for the people who would receive it."
    ],
    path: [
      "Demonstrate graft survival and function in a primate model.",
      "Complete long-term tumour-risk and genome-integrity testing.",
      "Investigational New Drug filing and a small first-in-human safety study.",
      "Multi-year follow-up before efficacy trials and FDA review."
    ]
  },
  {
    id: "als",
    name: "ALS",
    category: "Neurodegeneration",
    blurb: "Motor neurons die, and with them the ability to move, speak, and eventually breathe.",
    overview: "Amyotrophic lateral sclerosis, also called Lou Gehrig's disease, destroys the motor neurons that connect the brain and spinal cord to muscle. Most people live two to five years after diagnosis. A few drugs modestly slow progression, and one targets a rare genetic form.",
    problem: [
      "In about 97 percent of cases a protein called TDP-43 leaves the nucleus and clumps in the cell body.",
      "Without TDP-43 inside the nucleus, cells start splicing some genes incorrectly, inserting 'cryptic exons'.",
      "Two genes hit by this, STMN2 and UNC13A, are needed for motor neurons to repair and to communicate."
    ],
    ideaTitle: "Fix the downstream splicing errors even if TDP-43 stays broken",
    idea: "Rather than trying to put TDP-43 back, our concept targets what it fails to do. A small RNA-based therapy would block the cryptic exon in UNC13A and restore normal STMN2 splicing, so motor neurons can keep working while the upstream problem is studied.",
    steps: [
      "Design splice-switching oligonucleotides, or engineered U1 snRNAs, that mask the cryptic splice sites.",
      "Test in patient-derived motor neurons for restoration of full-length STMN2 and UNC13A.",
      "Deliver to the spinal cord, either by repeated spinal injection or a one-time viral vector.",
      "Track a molecular biomarker of restored splicing before looking for clinical benefit."
    ],
    evidence: "Cryptic exon inclusion in these genes was found in patient tissue, and splice-correcting oligonucleotides restore normal protein in cultured human neurons. Whether this helps a living animal's motor function is far less settled.",
    unknowns: [
      "Whether fixing two genes is enough when TDP-43 controls hundreds.",
      "Whether treatment can start early enough, since many patients are diagnosed after substantial neuron loss.",
      "Long-term safety of viral delivery to the spinal cord."
    ],
    path: [
      "Demonstrate benefit in a TDP-43 animal model with measured motor function.",
      "Dose-finding and toxicology in large animals.",
      "Investigational New Drug filing and Phase 1 safety trial.",
      "Larger trials with a survival and function endpoint, then FDA review."
    ]
  },
  {
    id: "type1-diabetes",
    name: "Type 1 diabetes",
    category: "Autoimmune / Metabolic",
    blurb: "The immune system destroys insulin-making cells, so insulin must be replaced for life.",
    overview: "In type 1 diabetes the body's own immune cells attack the beta cells in the pancreas that make insulin. People manage it with injections or pumps and constant glucose monitoring. Insulin keeps people alive but does not cure the disease.",
    problem: [
      "Autoimmune T cells destroy beta cells, often silently for years before diagnosis.",
      "Replacing the cells works in principle, but the immune system will attack new ones as well.",
      "Anti-rejection drugs prevent that, but they carry infection and cancer risks, so they are only offered to a small number of patients."
    ],
    ideaTitle: "Beta cells designed to be invisible to the immune system",
    idea: "Our concept is a lab-grown beta cell that can make insulin but is hard for immune cells to see. Genes for the molecules that display cell identity to T cells would be removed, and a 'don't-eat-me' signal added, so the graft can survive without lifelong immunosuppression.",
    steps: [
      "Differentiate stem cells into insulin-secreting islet-like clusters.",
      "Remove HLA class I and II genes and add CD47 or a similar protective signal.",
      "Check that the cells still sense glucose and secrete insulin on demand.",
      "Implant in a site that is easy to monitor and remove if needed."
    ],
    evidence: "Stem-cell-derived beta cells reverse diabetes in mice, and cells edited to hide from the immune system have survived in immune-competent animal models. Natural killer cells can still attack cells that lack HLA, so hiding is not complete.",
    unknowns: [
      "Whether cells that hide from T cells can also hide from natural killer cells for years.",
      "Whether an immune-invisible graft makes it harder for the body to detect and clear a tumour.",
      "How to switch the graft off if something goes wrong."
    ],
    path: [
      "Long-term survival data in an immune-competent large animal.",
      "A built-in kill switch tested for reliability.",
      "Investigational New Drug filing and a small safety trial.",
      "Efficacy trials measuring insulin independence, then FDA review."
    ]
  },
  {
    id: "huntingtons",
    name: "Huntington's disease",
    category: "Genetic / Neurodegeneration",
    blurb: "A single inherited gene change that slowly damages the brain, usually in midlife.",
    overview: "Huntington's is caused by an expanded run of 'CAG' repeats in the HTT gene. Each child of an affected parent has a 50 percent chance of inheriting it. Symptoms include involuntary movements, mood changes, and cognitive decline. Treatments only address symptoms.",
    problem: [
      "The expanded gene makes a toxic version of the huntingtin protein.",
      "The repeat tract is unstable: in brain cells, particularly in the striatum, it keeps growing over a person's life.",
      "Genetic studies suggest that it is this ongoing growth, driven by DNA mismatch repair proteins, that sets when disease begins."
    ],
    ideaTitle: "Stop the repeat from growing",
    idea: "Instead of silencing the whole gene, our concept targets the cellular machinery that makes the repeat longer. Reducing MSH3, a DNA mismatch repair protein tied to repeat growth, in striatal neurons could keep the repeat near its inherited length and delay symptom onset.",
    steps: [
      "Design an siRNA or antisense oligonucleotide that lowers MSH3 specifically in neurons.",
      "Confirm that repeat expansion slows in patient-derived cells and in a mouse model.",
      "Deliver to the striatum with a viral vector or direct infusion.",
      "Treat carriers before symptoms, guided by genetic testing."
    ],
    evidence: "Human genetics found that variants in MSH3 and other repair genes shift age at onset, and mice lacking MSH3 show less repeat expansion. This supports the target. It does not prove a drug against it is safe.",
    unknowns: [
      "MSH3 and its partners are involved in DNA repair, so lowering it could raise cancer risk.",
      "Whether slowing growth helps people whose repeats are already long.",
      "How long benefit would last, and whether treatment must be lifelong."
    ],
    path: [
      "Show reduced expansion and delayed pathology in animal models.",
      "Long-term safety testing focused on DNA repair and cancer risk.",
      "Investigational New Drug filing and first-in-human safety trial.",
      "A long prevention-style trial in carriers, then FDA review."
    ]
  },
  {
    id: "duchenne",
    name: "Duchenne muscular dystrophy",
    category: "Genetic / Muscle",
    blurb: "A missing muscle protein causes weakness that starts in childhood and worsens with age.",
    overview: "Duchenne affects mostly boys and is caused by mutations in the dystrophin gene, one of the largest in the human genome. Without dystrophin, muscle fibres tear easily and are gradually replaced by scar and fat. Steroids and a few genetic therapies exist, but none restores normal muscle.",
    problem: [
      "Dystrophin links the inside of a muscle fibre to its surroundings. Without it, contraction damages the cell.",
      "Muscle stem cells keep trying to repair the damage and eventually run out.",
      "Heart and breathing muscles are affected, and these usually limit lifespan."
    ],
    ideaTitle: "Correct the gene in the muscle stem cells themselves",
    idea: "Many current approaches add a shortened gene that must be re-dosed as cells turn over. Our concept uses prime editing to correct the patient's own dystrophin mutation, concentrating on muscle stem cells so that the repair is passed on to new muscle for life.",
    steps: [
      "Design a prime editor matched to the patient's exact mutation or reading-frame defect.",
      "Package the editor in a muscle-targeting viral capsid with a muscle-specific promoter.",
      "Confirm that edited stem cells contribute to new fibres that express full-length dystrophin.",
      "Include the heart, since cardiac failure is a leading cause of death."
    ],
    evidence: "Base and prime editing have restored dystrophin in mouse models. Viral gene therapy for Duchenne has also caused serious immune reactions in some patients, which is a major concern for any virus-delivered approach.",
    unknowns: [
      "Delivery: very large doses of virus are needed to reach all muscles.",
      "Editors are bulky, and fitting them into one vector is hard.",
      "Every mutation is different, so each version may need its own approval."
    ],
    path: [
      "Test in a large-animal model such as the dystrophic dog.",
      "Evaluate immune responses and off-target edits in depth.",
      "Investigational New Drug filing and a cautious dose-escalation trial.",
      "Efficacy trials with functional endpoints, then FDA review."
    ]
  },
  {
    id: "cystic-fibrosis",
    name: "Cystic fibrosis",
    category: "Genetic / Lung",
    blurb: "A faulty salt channel leaves thick mucus in the lungs. Modulators help most, but not all, patients.",
    overview: "Cystic fibrosis is caused by mutations in the CFTR gene, which makes a channel that moves chloride across cell surfaces. Highly effective modulator drugs now help the majority of patients, but some mutations do not respond, and the drugs must be taken every day.",
    problem: [
      "Without a working CFTR channel, airway mucus becomes thick and sticky.",
      "Bacteria colonise the lungs and cause repeated infection and inflammation.",
      "Over decades the airways are scarred and lung function falls."
    ],
    ideaTitle: "Edit the airway's own stem cells",
    idea: "Our concept is a one-time, inhaled therapy aimed at the airway's basal stem cells, which renew the lining. If these cells carry a corrected CFTR gene, the new lining cells they produce should carry it as well, including in patients whose mutations modulators do not help.",
    steps: [
      "Package a gene editor or a working CFTR sequence into a lipid nanoparticle that can cross mucus.",
      "Deliver by nebuliser to the airway.",
      "Verify that edited basal cells give rise to the correct cell types.",
      "Measure chloride transport in lung tissue, then lung function."
    ],
    evidence: "Gene correction restores CFTR function in patient-derived airway cells grown in the lab. Getting nanoparticles through thick CF mucus and into the right cells in a living lung has so far been the main obstacle.",
    unknowns: [
      "Whether enough basal stem cells can be reached to matter.",
      "Safety of repeated inhaled dosing if one round is not enough.",
      "Effects on other organs, which this airway-only approach would not address."
    ],
    path: [
      "Show durable correction in an animal with CF-like lung disease.",
      "Inhalation toxicology and biodistribution studies.",
      "Investigational New Drug filing and a Phase 1 safety trial.",
      "Efficacy trials measuring lung function, then FDA review."
    ]
  },
  {
    id: "multiple-sclerosis",
    name: "Multiple sclerosis",
    category: "Autoimmune / Neurology",
    blurb: "The immune system attacks the insulation around nerves, disrupting signals between brain and body.",
    overview: "In multiple sclerosis, immune cells attack myelin, the fatty coating that speeds nerve signals. Many drugs reduce relapses by suppressing parts of the immune system. They do much less for the slow progression of disability, and they leave patients more vulnerable to infection.",
    problem: [
      "Autoreactive T and B cells enter the central nervous system and damage myelin.",
      "The body can repair myelin, but repair fails with repeated attacks and age.",
      "Broad immune suppression treats the attack but not the specific cells causing it."
    ],
    ideaTitle: "Retrain the immune system rather than suppress it",
    idea: "Our concept uses regulatory T cells engineered with a receptor that recognises a myelin antigen. Placed where the attack occurs, they would calm only the local, targeted immune response, while the rest of the immune system keeps working. A second component would promote myelin repair.",
    steps: [
      "Collect the patient's regulatory T cells and add a myelin-specific receptor.",
      "Expand and check that the cells keep their regulatory identity and do not turn inflammatory.",
      "Infuse and track whether they reach the central nervous system.",
      "Pair with a drug that encourages myelin-making cells to mature."
    ],
    evidence: "Antigen-specific regulatory T cells protect against the mouse version of MS. Regulatory cells can lose their identity and turn harmful, and human data for engineered versions are limited.",
    unknowns: [
      "Which antigen to target, since MS patients react to several.",
      "Whether the cells would persist long enough to matter.",
      "Whether remyelination can be driven in long-standing, scarred lesions."
    ],
    path: [
      "Show stability and efficacy in humanised mouse models.",
      "Process development for reliable patient-specific manufacturing.",
      "Investigational New Drug filing and a safety trial with close monitoring.",
      "Efficacy trials on disability progression, then FDA review."
    ]
  },
  {
    id: "glioblastoma",
    name: "Glioblastoma",
    category: "Cancer / Brain",
    blurb: "The most common aggressive brain cancer in adults. It spreads into healthy tissue and resists treatment.",
    overview: "Glioblastoma is usually treated with surgery, radiation, and chemotherapy, and even then the typical survival is measured in months to a couple of years. The tumour almost always returns, because individual cells invade healthy brain where surgeons cannot remove them.",
    problem: [
      "Cancer cells within one tumour differ from each other, so a drug that hits one group leaves others behind.",
      "The blood-brain barrier blocks most drugs from reaching the tumour.",
      "The tumour suppresses local immune cells, so the immune system does not clear it."
    ],
    ideaTitle: "A tumour-selective virus that also wakes up the immune system",
    idea: "Our concept is an engineered virus that replicates only inside tumour cells, destroys them, and carries a payload that recruits immune cells. Focused ultrasound would temporarily open the blood-brain barrier so the virus can reach tumour cells beyond the edge of the surgery site.",
    steps: [
      "Modify a virus so it grows only in cells with the tumour's typical pathway defects.",
      "Add genes for immune-stimulating signals to turn a cold tumour hot.",
      "Open the blood-brain barrier briefly with focused ultrasound and microbubbles.",
      "Follow with immune checkpoint therapy to sustain the response."
    ],
    evidence: "Oncolytic viruses have shrunk tumours in animal models, and one such therapy has conditional approval in Japan for glioma. Results in people have been inconsistent, and the immune response is difficult to predict.",
    unknowns: [
      "Brain swelling from immune activation, which is dangerous in a closed skull.",
      "Whether enough virus reaches invading cells far from the main mass.",
      "Whether tumour cells will evolve to resist the virus."
    ],
    path: [
      "Test the virus-plus-ultrasound combination in animal models, with survival as the endpoint.",
      "Safety testing focused on brain inflammation.",
      "Investigational New Drug filing and Phase 1 dose-escalation.",
      "Randomised trials against standard care, then FDA review."
    ]
  }
];
