package com.miempresa.miapp.model;

public class Unit {
    private int id;
    private String tag;
    private String title;
    private String shape;
    private String color;

    public Unit() {}

    public Unit(int id, String tag, String title, String shape, String color) {
        this.id = id;
        this.tag = tag;
        this.title = title;
        this.shape = shape;
        this.color = color;
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getShape() { return shape; }
    public void setShape(String shape) { this.shape = shape; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}