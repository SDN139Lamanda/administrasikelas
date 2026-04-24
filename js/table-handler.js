(function() {
  'use strict';
  window.GS_Tables = {
    init(containerId) {
      const tbody = document.getElementById(containerId);
      if (!tbody || tbody.children.length > 0) return;
      tbody.innerHTML = this._rowTemplate();
      this._bindDelete(tbody);
    },
    addRow(containerId) {
      const tbody = document.getElementById(containerId);
      if (!tbody) return;
      tbody.insertAdjacentHTML('beforeend', this._rowTemplate());
      this._bindDelete(tbody);
    },
    clear(containerId) {
      const tbody = document.getElementById(containerId);
      if (tbody && confirm('Kosongkan semua baris?')) {
        tbody.innerHTML = this._rowTemplate();
        this._bindDelete(tbody);
      }
    },
    collect(containerId) {
      const tbody = document.getElementById(containerId);
      if (!tbody) return [];
      const data = [];
      tbody.querySelectorAll('tr').forEach(row => {
        const topik = row.querySelector('.gs-input-topik')?.value.trim();
        const jumlah = parseInt(row.querySelector('.gs-input-jumlah')?.value) || 0;
        const peruntukan = row.querySelector('.gs-select-peruntukan')?.value;
        const mapel = row.querySelector('.gs-input-mapel')?.value.trim();
        const tipe = row.querySelector('.gs-select-tipe')?.value;
        if (topik && jumlah > 0 && mapel) data.push({ topik, jumlah, peruntukan, mapel, tipe });
      });
      return data;
    },
    _rowTemplate() {
      return `<tr>
        <td><input class="gs-input-topik" type="text" placeholder="Topik/Materi"></td>
        <td><input class="gs-input-jumlah" type="number" min="1" max="50" value="5"></td>
        <td><select class="gs-select-peruntukan"><option value="Latihan">Latihan</option><option value="UTS">UTS</option><option value="UAS">UAS</option><option value="Tugas">Tugas</option></select></td>
        <td><input class="gs-input-mapel" type="text" placeholder="Mapel"></td>
        <td><select class="gs-select-tipe"><option value="Pilihan Ganda">Pilihan Ganda</option><option value="Isian">Isian</option><option value="Uraian">Uraian</option><option value="Campuran">Campuran</option></select></td>
        <td><button class="gs-btn-danger gs-del-btn" type="button">🗑️</button></td>
      </tr>`;
    },
    _bindDelete(tbody) {
      tbody.querySelectorAll('.gs-del-btn').forEach(btn => {
        btn.onclick = () => {
          if (tbody.rows.length > 1) btn.closest('tr').remove();
          else btn.closest('tr').querySelectorAll('input, select').forEach(el => el.value = '');
        };
      });
    }
  };
})();
