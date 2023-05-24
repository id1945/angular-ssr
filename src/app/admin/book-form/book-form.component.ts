import { Component, Output, EventEmitter, Input, OnChanges, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { Book } from '../../shared/book';
import { AsyncValidatorsService } from '../shared/async-validators.service';
import { atLeastOneValue, isbnFormat } from '../shared/validators';

@Component({
  selector: 'bm-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnChanges {
  @Input() book?: Book;
  @Output() submitBook = new EventEmitter<Book>();

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    subtitle: new FormControl('', { nonNullable: true }),
    isbn: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required,isbnFormat],
      asyncValidators: inject(AsyncValidatorsService).isbnExists()
    }),
    description: new FormControl('', { nonNullable: true }),
    published: new FormControl('', { nonNullable: true }),
    authors: this.buildAuthorsArray(['']),
    thumbnailUrl: new FormControl('', { nonNullable: true })
  });

  get fa() {
    return this.form.controls.authors;
  }

  ngOnChanges(): void {
    if (this.book) {
      this.setValues(this.book);
      this.setMode(true);
    } else {
      this.setMode(false);
    }
  }

  private setValues(book: Book) {
    this.form.patchValue(book);
    this.form.setControl('authors', this.buildAuthorsArray(book.authors));
  }

  private setMode(isEditing: boolean) {
    const isbnControl = this.form.controls.isbn;
    isEditing ? isbnControl.disable() : isbnControl.enable();
  }

  private buildAuthorsArray(authors: string[]) {
    return new FormArray(
      authors.map(v => new FormControl(v, { nonNullable: true })),
      atLeastOneValue
    );
  }

  addAuthorControl() {
    this.fa.push(new FormControl('', { nonNullable: true }));
  }

  submitForm() {
    const formValue = this.form.getRawValue();
    const authors = formValue.authors.filter(author => !!author);
    const newBook: Book = { ...formValue, authors };
    this.submitBook.emit(newBook);
  }
}
