<?php

// set expires header
header('Expires: Thu, 1 Jan 1970 00:00:00 GMT');

// set cache-control header
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0',false);

// set pragma header
header('Pragma: no-cache');



$preset=1;
echo '<html>
<head>
	
	<style>
		body {
		  background-color: black;
		}
		h1 {
		  color: #cdcdcd;
		}
		.grid-container {
		  padding: 15px;
		  --s:200px; /* controls the size */
		  --g: 15px; /* controls the gap */

		  display: grid;
  		  gap: var(--g);
  		  width: calc(5*var(--s) + 4*var(--g)); /* 5 times the size plus 4 times the gap */
  		  grid-template-columns: repeat(5, auto);

		}
				
		img.presets {
		  width: 180px;
		  min-width: 100%;
		  object-fit: cover;
		}

		a {
			position: relative;
			color: red;
			font-size: 14px;
			text-decoration: none;
		}

		.icons {
			height: 48px;
			width: 48px;
		}

		p {
			color: white;
		}

		.center {
			text-align: center;
		}
	</style>
</head>
<body>

<h1>Cam 1</h1>
<div class="grid-container">';


$n=1;    
while($n<=10){    
echo '
	<div>
		<img src="./preset'.$n.'.jpg" class="presets" />
		<span style="float: left; padding-left: 15px;"><a href="getimage.php?preset='.$n.'"><img src="images/baseline_save_white_24dp.png"/></a></span>
		<span style="float: right; padding-right: 15px;"><a href="getimage.php?call='.$n.'"><img src="images/baseline_play_arrow_white_24dp.png"/></a></span>
		<p class="center">Preset'.$n.'</p>
	</div>
	';    
$n++;    
}    

echo '
	
</div>
</body>'
?>