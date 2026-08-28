# Bludnisty Gif Browser

## Opis

**Bludnisty Gif Browser** to aplikacja służąca do przeglądania, wyszukiwania oraz przekazywania dalej plików zdjęciowych, głównie typu GIF.

Pliki są opatrzone o **tagi** ułatwiające wyszukiwanie oraz kategorie (**NSFW**, **Racist**, **Gore**).

Kliknięcie na zdjęcie powoduje skopiowanie jego linku do schowka.

## Informacje techniczne

Projekt składa się z dwóch aplikacji:
- aplikacji HTML, służącej do przeglądania plików, która jest dostępna przez GitHub Pages,
- aplikacji Node.js, (dalej **Storage Manager**) służącej do dodawania oraz zarządzania plikami.
  - jest ona dostępna jedynie lokalnie, po sklonowaniu repozytorium.

## Storage Manager

### Uruchamianie

1. Sklonuj repozytorium.
2. Pobierz paczki npm:
```console
npm i
```
3. Uruchom aplikacje Node.js:
```console
node storage_manager/index.js
```
4. W przeglądarce przejdź pod adres http://localhost:3000/.

### Dodawanie plików

1. Dodaj pliki do katalogu `storage/gif`.
2. Odświerz Storage Manager w przeglądarce. Nowo dodane pliki powinny znajdować się w sekcji `Not in storage` na górze strony.
3. Nadaj plikom tagi, na podstawie których będą wyszukiwane.
    - <ins>Algorytm wyszukiwania bierze pod uwagę kolejność słów.</ins>
4. Nadaj plikom kategorie (NSFW, Racist, Gore) (opcjonalnie)
5. Zapisz zmiany naciskając przycisk na górze strony.

**Uwaga:** pliki bez tagów nie zostaną dodane do sekcji `In storage`!

### Edycja plików
1. Tagi oraz kategorie można edytować w sekcji `In storage`, zapisując zmiany przyciskiem na górze strony.
2. Nazwy plików można zmienić poprzez naciśnięcie na nią. Pojawi się okno dialogowe umożliwiające zmiane.

### Usuwanie plików
1. Aby usunąć plik z wyświetlanych w aplikacji (z sekcji `In storage` do sekcji `Not in storage`) należy usunąć jego tagi oraz zapisać zmiany.
2. Aby usunąć plik z systemu plików, należy nacisnąć jego nazwę i wybrać odpowiednią opcję w oknie dialogowym.

### Inne
- Najechanie kursorem na miniaturę zdjęcia powoduje jego powiększenie.
