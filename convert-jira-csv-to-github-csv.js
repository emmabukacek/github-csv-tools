#!/usr/bin/env node

const program = require('commander');
const J2M = require('J2M');
const csv = require('csv');
const fs = require('fs');

program
  .arguments('[file]')
  .option(
    "-t, --team [team]",
    "The team to create a label under"
  )
  .action((file, options) => {
    let result;

    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error('Yo friend you DONE MESSED UP.');
        console.error(err);
        process.exit(1);
      }
      csv.parse(data, {trim: true}, (err, parsedCsv) => {
        if (err) throw err;

        const [cols, ...rows] = parsedCsv;

        const teamLabel = `retail-${options.team}`
        const newColumns = ['title', 'body', 'labels', 'comments'];

        const descriptionIndex = cols.indexOf("Description"); // Body
        const epicIndex = cols.indexOf("Custom field (Epic Name)"); // Label (Epic:<Name>)
        const issueTypeIndex = cols.indexOf("Issue Type"); // Label
        const summaryIndex = cols.indexOf("Summary"); // Title
        const fixVersion = cols.indexOf("Fix versions"); // Label

        const commentsIndexes = cols.reduce((acc, name, idx) => {
          if (name !== "Comment") return acc;
          return [...acc, idx]
        }, []); // Label

        const labelIndexes = cols.reduce((acc, name, idx) => {
          if (name !== "Labels") return acc;
          return [...acc, idx]
        }, []); // Label

        const parsedRows = rows.map((row, idx) => {
          const newRow = [];
          const labels = [];

          newRow.push(row[summaryIndex]);
          newRow.push(J2M.toM(row[descriptionIndex]));

          // Labels
          labels.push(teamLabel);
          if (row[epicIndex]) labels.push(`Epic:${row[epicIndex]}`);
          if (row[issueTypeIndex] === "Epic" || row[issueTypeIndex] === "Bug") {
            labels.push(row[issueTypeIndex]);
          }
          if (row[fixVersion]) {
            const cycleTitle = row[fixVersion].toLowerCase().replace(/\s/g, "-");
            labels.push(`retail-growth-${cycleTitle}`);
          }

          labelIndexes.forEach(idx => row[idx] && labels.push(row[idx]));

          newRow.push(labels);

          // Comments
          newRow.push(commentsIndexes
            .filter(idx => row[idx])
            .map(idx => J2M.toM(row[idx])));

          return newRow;
        });

        result = [newColumns, ...parsedRows];

        console.log(result);
      });
    });

    return result;
  })
  .parse(process.argv);
