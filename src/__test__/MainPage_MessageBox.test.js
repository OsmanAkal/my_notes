import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainPageMessageBox from '../MainPageMessageBox';

test('component shows title and message when show is true', () => {
  render(
    <MainPageMessageBox
      show={true}
      title="Test Title"
      message="This is a test message"
      cancelText="Close"
    />
  );

  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('This is a test message')).toBeInTheDocument();

  expect(screen.getByText('Close')).toBeInTheDocument();
});

test('component does not render when show is false', () => {
  const { container } = render(
    <MainPageMessageBox show={false} title="Test" message="Test" />
  );

  expect(container.firstChild).toBeNull();
});

test('onCancel and onConfirm callbacks are called', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();

  render(
    <MainPageMessageBox
      show={true}
      title="Test"
      message="Test"
      cancelText="Close"
      confirmText="Ok"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );

  fireEvent.click(screen.getByText('Close'));
  expect(onCancel).toHaveBeenCalled();

  fireEvent.click(screen.getByText('Ok'));
  expect(onConfirm).toHaveBeenCalled();
});
