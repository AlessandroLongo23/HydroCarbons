<script>
	const open_info = () => { 
		// document.getElementById("info").style.width = "100%";
	}

	const close_info = () => {
		// document.getElementById("info").style.width = "0";
	}
</script>

<header class="row">
	<button class="icon" aria-label="Home"></button>

	<h1 id="main_header">Idrocarburi e derivati</h1>

	<button onclick={open_info} class="icon" aria-label='info'><i class="fas fa-info-circle"></i></button> 
</header>

<div class="info" id="info">
	<div class="row">
		<button aria-label='align'></button>
		<h4>Idrocarburi e derivati</h4>
		<button id="close_info" onclick={close_info}>&times;</button>
	</div>

	<div>
		<p style="padding: 0px 50px">
			Gli <a href="https://it.wikipedia.org/wiki/Idrocarburi" target="_blank">idrocarburi</a> sono i più semplici e diffusi composti
			organici, composti solamente da carbonio (C) e idrogeno (H). Ampiamente utilizzati come combustibili, la loro struttura consiste
			di una catena di atomi di carbonio, tra di loro uniti da legami covalenti (il C ne può instaurare fino a 4), a cui sono legati
			gli atomi di idrogeno.<br>
			Quando a questi tre elementi si aggiungono ossigeno (O), azoto (N) e gli alogeni quali fluoro (F), cloro (Cl), bromo (Br) e iodio (I),
			si ottengono i cosiddetti derivati degli idrocarburi (<a href="https://it.wikipedia.org/wiki/Alcoli" target="_blank">alcoli</a>,
			<a href="https://it.wikipedia.org/wiki/Fenoli" target="_blank">fenoli</a>,
			<a href="https://it.wikipedia.org/wiki/Eteri" target="_blank">eteri</a>,
			<a href="https://it.wikipedia.org/wiki/Esteri" target="_blank">esteri</a>,
			<a href="https://it.wikipedia.org/wiki/Acidi_carbossilici" target="_blank">acidi carbossilici</a>)<br>
			<br>
			In questo programma puoi comporre le tue molecole disponendo nella griglia centrale i gruppi funzionali dell'elenco sinistro
			e gli alogeni dell'elenco destro; a destra puoi spuntare le checkbox e ricevere informazioni utili sulla molecola, come la
			catena carboniosa principale o il nome della molecola (se ci clicchi verrai reindirizzato alla pagina wikipedia del composto,
			anche se queste sono dettagliate solamente per quelli più comuni e semplici).
			Infine, con le frecce in basso a destra puoi spostare l'intera molecola sulla griglia e, con il tasto di reset a sinistra,
			puoi cancellare tutto e tornare allo stato di partenza, cioè la l'idrocarburo più semplice: il metano (CH<sub>4</sub>)<br>
			<br>
			Clicca <a href="2D.js" target="_blank">qui</a> per consultare il codice JavaScript della visualizzazione 2D.<br>
			Clicca <a href="3D.js" target="_blank">qui</a> per consultare il codice JavaScript della visualizzazione 3D.
		</p>
	</div>
</div>

<body>
	<div class="row" style="margin: 0px 0px 25px 0px">
		<div class="column" id="sx">
			<ul class="column" id="functional_groups_list">
				<h1 id="functional_groups_title" style="margin: 25px 0px 20px 0px">Gruppi funzionali</h1>

				<div class="row">
				<div class="row">
					<input type="radio" name="group" id="CH3" checked>
					<label for="CH3" class="gf_btn" id="CH3_label">CH<sub>3</sub><br><span class="caption">alchilico</span></label>

					<div class="column" style="justify-content: center">
						<input type="radio" name="group" id="CH2">
						<label for="CH2" class="gf_btn" id="CH2_label">CH<sub>2</sub></label>

						<input type="radio" name="group" id="CH">
						<label for="CH" class="gf_btn" id="CH_label">CH</label>
					</div>
				</div>

				<input type="radio" name="group" id="OH">
				<label for="OH" class="gf_btn" id="OH_label">-OH <br><span class="caption">ossidrile</span></label>
				</div>

				<div class="row">
				<input type="radio" name="group" id="O">
				<label for="O" class="gf_btn" id="O_label">-0-<br><span class="caption">etere</span></label>

				<input type="radio" name="group" id="CO">
				<label for="CO" class="gf_btn" id="CO_label">>C0 <br><span class="caption">carbonile</span></label>
				</div>

				<div class="row">
				<input type="radio" name="group" id="COOH" disabled>
				<label for="COOH" class="gf_btn" id="COOH_label">-COOH <br><span class="caption">carbossile</span></label>

				<input type="radio" name="group" id="COO" disabled>
				<label for="COO" class="gf_btn" id="COO_label">-COO-<br><span class="caption">estere</span></label>
				</div>

				<div class="row">
				<input type="radio" name="group" id="CON" disabled>
				<label for="CON" class="gf_btn" id="CON_label">-CON <br><span class="caption">ammidico</span></label>

				<input type="radio" name="group" id="NH2" disabled>
				<label for="NH2" class="gf_btn" id="NH2_label">-NH<sub>2</sub> <br><span class="caption">amminico</span></label>
				</div>
			</ul>

			<div class="row">
				<image class="button" id="flscr_btn" src="../../../Icons/expand.png"></image>

				<button class="button" id="reset_btn">Reset</button>
			</div>
		</div>

		<div class="column" id="center">
			<a id="molecule_name" href="" target="_blank"></a>
		</div>

		<div class="column" id="dx">
			<ul class="column" id="halogens_list">
				<h1 style="margin: 25px 0px 20px">Alogeni</h1>
				<div class="row" style="justify-content: center">
				<input type="radio" name="group" id="fluorine">
				<label for="fluorine" class="hal_btn" id="F_label">F</label>

				<input type="radio" name="group" id="chlorine">
				<label for="chlorine" class="hal_btn" id="Cl_label">Cl</label>

				<input type="radio" name="group" id="bromine">
				<label for="bromine" class="hal_btn" id="Br_label">Br</label>

				<input type="radio" name="group" id="iodine">
				<label for="iodine" class="hal_btn" id="I_label">I</label>
				</div>
			</ul>

			<ul class="column" id="checkbox_list">
				<label class="container" id="name_checkbox">Mostra Nome della Molecola
				<input type="checkbox" id="show_name" checked>
				<span class="checkmark"></span>
				</label>

				<label class="container" id="highlight_checkbox">Evidenzia Catena Carboniosa
				<input type="checkbox" id="highlight" checked>
				<span class="checkmark"></span>
				</label>

				<label class="container" id="numbers_checkbox">Numera Atomi di Carbonio
				<input type="checkbox" id="numbers" checked>
				<span class="checkmark"></span>
				</label>

				<label class="container" id="oxidation_checkbox">Assegna Numeri di Ossidazione
				<input type="checkbox" id="oxidation_n">
				<span class="checkmark"></span>
				</label>
			</ul>

			<div class="row" id="bottom_section">
				<div class="column">
				<h2>Visualizzazione</h2>
				<div class="row">
					<input type="radio" name="visualization" id="2D" checked>
					<label for="2D" id="label_2D">2D</label>
					<input type="radio" name="visualization" id="3D">
					<label for="3D" id="label_3D">3D</label>
				</div>
				</div>

				<div class="column" style="padding: 0px 25px; align-self: flex-end">
				<button class="arr_btn button" id="up_arrow">&uarr;</button>
				<div class="row" style="justify-content: center">
					<button class="arr_btn button" id="left_arrow">&larr;</button>
					<button class="arr_btn button" id="down_arrow">&darr;</button>
					<button class="arr_btn button" id="right_arrow">&rarr;</button>
				</div>
				</div>
			</div>
		</div>
	</div>
</body>

<footer id="footer" class="row">
	<h3 id="author">Programmed by Alessandro Longo</h3>
	<h3 id="class">5D 2020/2021</h3>
	<h3 id="version">v2.1</h3>
</footer>

<style>

</style>