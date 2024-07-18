<template>
<div id="lineChart">
饼状图
  <div id="main">

  </div>
</div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as echarts from 'echarts';

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
};

option && myChart.setOption(option);

</script>

<style scoped lang="scss">

</style>
