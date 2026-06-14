<?php

namespace App\Http\Controllers\RealEstate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BlokKavling;
use Inertia\Inertia;

class SitePlanController extends Controller
{
    public function index()
    {
        $kavlings = BlokKavling::with('tipeRumah')->get();
        return Inertia::render('RealEstate/SitePlan/Index', [
            'kavlings' => $kavlings
        ]);
    }
}
