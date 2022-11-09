<template>
    <defs>
        <pattern id="ricepaper" patternUnits="userSpaceOnUse" width="300" height="300">
            <image href="../../assets/background.png" x="0" y="0" width="300" height="300" preserveAspectRatio="none" />
        </pattern>
        <pattern id="basin-strip" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(45)">
			<line x1="0" y="0" x2="0" y2="16" :stroke="Theme.Color.borderLight" stroke-width="14" />
		</pattern>
    </defs>
</template>

<script setup>

import * as Theme from "@/theme";

</script>