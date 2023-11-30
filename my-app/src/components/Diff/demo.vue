<template>
  <div class="wrapper">
    <table>
      <thead>
        <tr>
          <th>Json 1</th>
          <th>Json 2</th>
        </tr>
      </thead>
      <tbody>
        <template>
          <tr v-for="(row, index) in rows" :key="index">
            <td class="json-1-cell">{{ row.json1 }}</td>
            <td class="json-2-cell">{{ row.json2 }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
//     json1: Object,
//     json2: Object,
  },
  data() {
    return {
      rows: [],
      json1:require("./data.json"),
      json2:require("./data2.json")
    };
  },
  created() {
    this.generateRows();
  },
  methods: {
    generateRows() {
      const json1Keys = Object.keys(this.json1);
      const json2Keys = Object.keys(this.json2);
      const keys = Array.from(new Set([...json1Keys, ...json2Keys]));

      this.rows = keys.map((key) => {
        const isDifferent = this.json1[key] !== this.json2[key];
        const isNew =
          !this.json1.hasOwnProperty(key) && this.json2.hasOwnProperty(key);
        const json1Value = this.json1[key] || "";
        const json2Value = this.json2[key] || "";

        return {
          json1:
            isDifferent ||
            (!this.json1.hasOwnProperty(key) && !this.json2.hasOwnProperty(key))
              ? this.generateHighlightedCell(
                  json1Value,
                  true,
                  isDifferent || isNew
                )
              : "",
          json2:
            isDifferent || isNew
              ? this.generateHighlightedCell(json2Value, isNew, isDifferent)
              : "",
        };
      });
    },
    generateHighlightedCell(value, isNew, isDifferent) {
      const bgColor = isNew
        ? "bg-green"
        : isDifferent
        ? "bg-yellow"
        : "bg-white";

      return `<div class="highlighted-cell ${bgColor}">${value}</div>`;
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

table {
  border-collapse: collapse;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 80%;
  max-width: 800px;
}

thead {
  background-color: #f2f2f2;
  font-weight: bold;
}

th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

td {
  border: 1px solid #ddd;
  padding: 8px;
}

.json-1-cell {
  border-right: none;
}

.json-2-cell {
  border-left: none;
}

.highlighted-cell {
  padding: 8px;
  height: 100%;
  width: 100%;
}

.bg-white {
  background-color: #fff;
}

.bg-yellow {
  background-color: #ffe58f;
}

.bg-green {
  background-color: #b7eb8f;
}
</style>