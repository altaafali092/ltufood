<?php

namespace App\Services;

use RuntimeException;
use ZipArchive;

/**
 * Generates a minimal, dependency-free Office Open XML (.xlsx) workbook.
 *
 * The project does not ship a spreadsheet library, so this writes the handful
 * of XML parts Excel expects and packages them with the built-in ZipArchive.
 */
class XlsxWriter
{
    /**
     * @param  array<int, string>  $headings
     * @param  array<int, array<int, string|int|float|null>>  $rows
     */
    public function __construct(
        private readonly array $headings,
        private readonly array $rows,
        private readonly string $sheetName = 'Sheet 1',
    ) {}

    public function build(): string
    {
        $path = tempnam(sys_get_temp_dir(), 'xlsx');

        if ($path === false) {
            throw new RuntimeException('Unable to create a temporary file for the spreadsheet export.');
        }

        try {
            $archive = new ZipArchive;
            $opened = $archive->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE);

            if ($opened !== true) {
                throw new RuntimeException('Unable to open the spreadsheet archive for writing.');
            }

            $archive->addFromString('[Content_Types].xml', $this->contentTypes());
            $archive->addFromString('_rels/.rels', $this->rootRelationships());
            $archive->addFromString('xl/workbook.xml', $this->workbook());
            $archive->addFromString('xl/_rels/workbook.xml.rels', $this->workbookRelationships());
            $archive->addFromString('xl/styles.xml', $this->styles());
            $archive->addFromString('xl/worksheets/sheet1.xml', $this->worksheet());
            $archive->close();

            $contents = file_get_contents($path);

            if ($contents === false) {
                throw new RuntimeException('Unable to read the generated spreadsheet.');
            }

            return $contents;
        } finally {
            if (is_file($path)) {
                unlink($path);
            }
        }
    }

    private function contentTypes(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            .'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            .'<Default Extension="xml" ContentType="application/xml"/>'
            .'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            .'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            .'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            .'</Types>';
    }

    private function rootRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            .'</Relationships>';
    }

    private function workbook(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            .'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            .'<sheets><sheet name="'.$this->escape($this->sheetName).'" sheetId="1" r:id="rId1"/></sheets>'
            .'</workbook>';
    }

    private function workbookRelationships(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            .'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            .'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            .'</Relationships>';
    }

    private function styles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<fonts count="2">'
            .'<font><sz val="11"/><color theme="1"/><name val="Calibri"/></font>'
            .'<font><b/><sz val="11"/><color theme="1"/><name val="Calibri"/></font>'
            .'</fonts>'
            .'<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            .'<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
            .'<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            .'<cellXfs count="3">'
            .'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            .'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
            .'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
            .'</cellXfs>'
            .'<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
            .'</styleSheet>';
    }

    private function worksheet(): string
    {
        $rows = ['<row r="1">'.$this->headingCells().'</row>'];

        $rowNumber = 2;

        foreach ($this->rows as $index => $row) {
            $isTotal = $index === count($this->rows) - 1 && $this->isTotalRow($row);
            $rows[] = '<row r="'.$rowNumber.'">'.$this->dataCells($row, $rowNumber, $isTotal).'</row>';
            $rowNumber++;
        }

        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            .'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            .'<sheetData>'.implode('', $rows).'</sheetData>'
            .'</worksheet>';
    }

    private function headingCells(): string
    {
        $cells = '';

        foreach ($this->headings as $column => $heading) {
            $reference = $this->columnLetter($column).'1';
            $cells .= '<c r="'.$reference.'" s="1" t="inlineStr"><is><t>'.$this->escape($heading).'</t></is></c>';
        }

        return $cells;
    }

    /**
     * @param  array<int, string|int|float|null>  $row
     */
    private function dataCells(array $row, int $rowNumber, bool $isTotal): string
    {
        $cells = '';

        foreach ($row as $column => $value) {
            $reference = $this->columnLetter($column).$rowNumber;

            if (is_int($value) || is_float($value)) {
                $cells .= '<c r="'.$reference.'" s="2"><v>'.$value.'</v></c>';

                continue;
            }

            $style = $isTotal ? ' s="1"' : '';
            $cells .= '<c r="'.$reference.'"'.$style.' t="inlineStr"><is><t>'.$this->escape((string) $value).'</t></is></c>';
        }

        return $cells;
    }

    /**
     * @param  array<int, string|int|float|null>  $row
     */
    private function isTotalRow(array $row): bool
    {
        return str_starts_with(strtolower((string) ($row[0] ?? '')), 'total');
    }

    private function columnLetter(int $index): string
    {
        $letter = '';
        $index++;

        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)).$letter;
            $index = intdiv($index, 26);
        }

        return $letter;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }
}
